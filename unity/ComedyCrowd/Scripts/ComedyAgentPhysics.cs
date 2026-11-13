using UnityEngine;

namespace ComedyCrowd
{
    /// <summary>
    /// A wobbly two-body comedy character: a pelvis pushed toward a target with forces, and a heavier
    /// torso/head on top, held by a ConfigurableJoint and kept upright by a spring-damper torque.
    ///
    /// Step 1: movement + upright torque + ApplyKnockout(duration).
    /// Step 2: hard bumps against other agents or walls make it Stumble for 1.5 s (joint at half
    ///         stiffness, a random sideways shove, then a curve-driven recovery); falling agents pass
    ///         part of the hit to whoever they crash into (domino effect).
    /// Step 3: no per-agent FixedUpdate: CrowdPhysicsManager calls Tick() for every agent in one loop
    ///         and switches far-away agents to a cheap kinematic level of detail (SetLod).
    ///
    /// Suggested hierarchy (see README):
    ///   Agent (this script)
    ///     ├─ Pelvis  (Rigidbody + Collider + ComedyCollisionRelay)
    ///     └─ Torso   (Rigidbody + Collider + ConfigurableJoint → Pelvis + ComedyCollisionRelay)
    /// </summary>
    [DisallowMultipleComponent]
    public class ComedyAgentPhysics : MonoBehaviour
    {
        [Header("Bodies")]
        public Rigidbody pelvisRb;
        public Rigidbody torsoRb;
        [Tooltip("Joint on the torso whose connected body is the pelvis. Found automatically if empty.")]
        public ConfigurableJoint joint;

        [Header("Movement")]
        public Transform target;
        [Tooltip("Used when no target Transform is set.")]
        public Vector3 targetPosition;
        [Tooltip("Top walking speed (m/s).")]
        public float maxSpeed = 3.2f;
        [Tooltip("How hard the pelvis chases the wanted velocity.")]
        public float moveGain = 8f;
        [Tooltip("Cap on the walking acceleration (m/s²).")]
        public float maxMoveAccel = 25f;
        public float arriveRadius = 0.6f;
        [Tooltip("Yaw spring that turns the pelvis toward where it walks.")]
        public float turnSpring = 10f;
        public float turnDamper = 2.5f;

        [Header("Upright torque (self-balance)")]
        [Tooltip("Spring of the self-righting torque (acceleration per radian of tilt).")]
        public float uprightSpring = 140f;
        [Tooltip("Damping of the self-righting torque.")]
        public float uprightDamper = 14f;
        [Range(0f, 1f), Tooltip("Share of the balance torque also applied to the pelvis.")]
        public float pelvisUprightShare = 0.4f;

        [Header("Knockout")]
        [Tooltip("Impact speed (relativeVelocity) that knocks the agent out instead of making it stumble.")]
        public float knockoutImpact = 9f;
        public float knockoutDuration = 2.5f;
        [Tooltip("Seconds to get the balance back once the knockout ends.")]
        public float knockoutRecovery = 0.8f;
        [Range(0f, 1f), Tooltip("Balance left while knocked out (0 = pure rag doll).")]
        public float knockoutBalance = 0.05f;

        [Header("Stumble (step 2)")]
        [Tooltip("Impact speed that starts a stumble.")]
        public float stumbleImpact = 3.5f;
        public float stumbleDuration = 1.5f;
        [Tooltip("Size of the random sideways shove when a stumble starts (m/s).")]
        public float stumbleLateralImpulse = 2.2f;
        [Tooltip("0 → 1 over the stumble: how much stiffness and balance have come back.")]
        public AnimationCurve stumbleRecovery = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);
        [Tooltip("Angular drag while stumbling or knocked out: low = spins and rolls a lot.")]
        public float fallenAngularDamping = 0.05f;
        [Tooltip("Layers that count as walls. Floor contacts (normals pointing up) are always ignored.")]
        public LayerMask wallLayers = ~0;
        [Range(0f, 1f), Tooltip("Domino: share of a fall passed on to the agent we crash into.")]
        public float dominoTransfer = 0.6f;
        [Tooltip("Minimum time between two stumbles.")]
        public float stumbleCooldown = 0.35f;

        [Header("Comedy setup (optional, applied in Awake)")]
        [Tooltip("Makes the torso heavier than the pelvis so quick turns whip the top half around.")]
        public bool applyComedyMass = true;
        public float pelvisMass = 1f;
        public float torsoMassRatio = 1.4f;
        [Tooltip("Gives the colliders a slightly bouncy material so packed bodies bump off each other.")]
        public bool applyBouncyMaterial = true;
        [Range(0f, 1f)] public float bounciness = 0.2f;

        // ----- state -----
        public bool IsKnockedOut => knockoutTimer > 0f;
        public bool IsStumbling => stumbleTimer > 0f;
        public bool IsRecovering => !IsKnockedOut && recoverTimer < knockoutRecovery;
        /// <summary>0..1 multiplier on the balance torque (1 = fully in control).</summary>
        public float Balance { get; private set; } = 1f;
        /// <summary>Level of detail chosen by the manager: 0 full physics, 1 kinematic torso, 2 fully kinematic.</summary>
        public int Lod { get; private set; }
        internal int managerIndex = -1;

        float knockoutTimer, stumbleTimer, recoverTimer = 999f, lastStumbleTime = -999f;
        float pelvisBaseAngDamp, torsoBaseAngDamp, appliedStiffness = 1f;
        bool lowDamping;
        JointDrive baseSlerp;
        Vector3 torsoLocalPos;
        Quaternion torsoLocalRot;
        RigidbodyConstraints pelvisBaseConstraints;

        // ================= setup =================
        void Awake()
        {
            if (!joint && torsoRb) joint = torsoRb.GetComponent<ConfigurableJoint>();
            if (!pelvisRb || !torsoRb || !joint)
            {
                Debug.LogError($"{name}: ComedyAgentPhysics needs pelvisRb, torsoRb and a ConfigurableJoint on the torso.", this);
                enabled = false; return;
            }
            if (applyComedyMass) { pelvisRb.mass = pelvisMass; torsoRb.mass = pelvisMass * torsoMassRatio; }
            if (applyBouncyMaterial) ApplyMaterial();

            // the joint: torso pinned to the pelvis, free to wobble, pulled back by a slerp drive
            joint.connectedBody = pelvisRb;
            joint.xMotion = joint.yMotion = joint.zMotion = ConfigurableJointMotion.Locked;
            joint.angularXMotion = joint.angularYMotion = joint.angularZMotion = ConfigurableJointMotion.Free;
            joint.rotationDriveMode = RotationDriveMode.Slerp;
            baseSlerp = joint.slerpDrive;
            if (baseSlerp.positionSpring <= 0f)
                baseSlerp = new JointDrive { positionSpring = 600f, positionDamper = 35f, maximumForce = float.MaxValue };
            joint.slerpDrive = baseSlerp;

            pelvisBaseAngDamp = ComedyPhysicsCompat.GetAngularDamping(pelvisRb);
            torsoBaseAngDamp = ComedyPhysicsCompat.GetAngularDamping(torsoRb);
            pelvisBaseConstraints = pelvisRb.constraints;
            torsoLocalPos = pelvisRb.transform.InverseTransformPoint(torsoRb.position);
            torsoLocalRot = Quaternion.Inverse(pelvisRb.rotation) * torsoRb.rotation;

            // collisions from both bodies come back to this script
            foreach (var rb in new[] { pelvisRb, torsoRb })
            {
                var relay = rb.GetComponent<ComedyCollisionRelay>();
                if (!relay) relay = rb.gameObject.AddComponent<ComedyCollisionRelay>();
                relay.agent = this;
            }
        }

        void ApplyMaterial()
        {
#if UNITY_6000_0_OR_NEWER
            var pm = new PhysicsMaterial("ComedyBounce") { bounciness = bounciness, bounceCombine = PhysicsMaterialCombine.Average, dynamicFriction = 0.5f, staticFriction = 0.6f };
#else
            var pm = new PhysicMaterial("ComedyBounce") { bounciness = bounciness, bounceCombine = PhysicMaterialCombine.Average, dynamicFriction = 0.5f, staticFriction = 0.6f };
#endif
            foreach (var c in torsoRb.GetComponentsInChildren<Collider>()) c.sharedMaterial = pm;
            foreach (var c in pelvisRb.GetComponentsInChildren<Collider>()) c.sharedMaterial = pm;
        }

        void OnEnable() { if (pelvisRb && torsoRb && joint) CrowdPhysicsManager.Register(this); }
        void OnDisable() { CrowdPhysicsManager.Unregister(this); }

        // ================= public API =================
        /// <summary>Step 1: knocks the agent out: the balance torque almost disappears for a while, then comes back.</summary>
        public void ApplyKnockout(float duration)
        {
            knockoutTimer = Mathf.Max(knockoutTimer, duration);
            recoverTimer = 0f;
            stumbleTimer = 0f;
            SetLowDamping(true);
        }

        /// <summary>Step 2: a stumble: half-stiff joint, a random sideways shove, then a gradual recovery.</summary>
        public void Stumble(Vector3 pushDirection, float strength = 1f)
        {
            if (IsKnockedOut || Lod != 0) return;
            if (Time.time - lastStumbleTime < stumbleCooldown) return;
            lastStumbleTime = Time.time;
            stumbleTimer = stumbleDuration;

            Vector3 fwd = pelvisRb.transform.forward; fwd.y = 0f;
            Vector3 side = Vector3.Cross(Vector3.up, fwd.sqrMagnitude > 1e-4f ? fwd.normalized : Vector3.forward);
            if (Random.value < 0.5f) side = -side;
            pushDirection.y = 0f;
            Vector3 shove = (side * Random.Range(0.6f, 1f) + pushDirection.normalized * 0.5f) * (stumbleLateralImpulse * strength);
            torsoRb.AddForce(shove, ForceMode.VelocityChange);         // the top half gets the shove: whip
            pelvisRb.AddForce(shove * 0.4f, ForceMode.VelocityChange);
            SetLowDamping(true);
        }

        public void SetTarget(Vector3 position) { target = null; targetPosition = position; }

        // ================= collisions (step 2) =================
        internal void HandleCollision(Collision c)
        {
            if (Lod != 0) return;
            float impact = c.relativeVelocity.magnitude;
            if (impact < stumbleImpact) return;

            var other = c.collider.GetComponentInParent<ComedyAgentPhysics>();
            if (other == this) return;
            if (!other)
            {
                if ((wallLayers.value & (1 << c.gameObject.layer)) == 0) return;
                if (c.contactCount > 0 && Vector3.Dot(c.GetContact(0).normal, Vector3.up) > 0.7f) return;   // the floor
            }

            Vector3 away = pelvisRb.position - c.collider.bounds.center; away.y = 0f;
            if (away.sqrMagnitude < 1e-4f) away = Random.insideUnitSphere;

            if (impact >= knockoutImpact) ApplyKnockout(knockoutDuration);
            else Stumble(away, Mathf.Lerp(0.6f, 1f, Mathf.InverseLerp(stumbleImpact, knockoutImpact, impact)));

            // domino: while we are going down, whoever we crash into loses their footing too
            if (other && dominoTransfer > 0f && (IsStumbling || IsKnockedOut) && !other.IsStumbling && !other.IsKnockedOut)
                other.Stumble(-away, dominoTransfer);
        }

        // ================= per-step update (called by CrowdPhysicsManager) =================
        internal void Tick(float dt)
        {
            if (Lod == 2) { KinematicMove(dt, true); return; }   // far away: no physics at all
            if (Lod == 1) { DynamicMove(dt); KinematicTorso(); return; }   // mid-distance: pelvis only

            UpdateTimers(dt);
            UpdateJointStiffness();
            DynamicMove(dt);
            ApplyUpright(torsoRb, Balance);
            ApplyUpright(pelvisRb, Balance * pelvisUprightShare);
        }

        void UpdateTimers(float dt)
        {
            if (knockoutTimer > 0f) knockoutTimer -= dt;
            else if (recoverTimer < knockoutRecovery) recoverTimer += dt;
            if (stumbleTimer > 0f) stumbleTimer -= dt;

            float b = 1f;
            if (IsKnockedOut) b = knockoutBalance;
            else if (IsRecovering) b = Mathf.Lerp(knockoutBalance, 1f, recoverTimer / Mathf.Max(0.01f, knockoutRecovery));
            if (IsStumbling) b = Mathf.Min(b, Mathf.Lerp(0.5f, 1f, stumbleRecovery.Evaluate(1f - stumbleTimer / stumbleDuration)));
            Balance = b;

            if (lowDamping && !IsKnockedOut && !IsStumbling && !IsRecovering) SetLowDamping(false);
        }

        // the joint loses half its stiffness in a stumble (and most of it when knocked out), then eases back
        void UpdateJointStiffness()
        {
            float k = 1f;
            if (IsKnockedOut) k = 0.15f;
            else if (IsRecovering) k = Mathf.Lerp(0.15f, 1f, recoverTimer / Mathf.Max(0.01f, knockoutRecovery));
            if (IsStumbling) k = Mathf.Min(k, Mathf.Lerp(0.5f, 1f, stumbleRecovery.Evaluate(1f - stumbleTimer / stumbleDuration)));
            if (Mathf.Abs(k - appliedStiffness) < 0.02f) return;   // writing a drive wakes the solver: only when it changed
            appliedStiffness = k;
            var d = baseSlerp; d.positionSpring *= k; d.positionDamper *= Mathf.Lerp(0.5f, 1f, k);
            joint.slerpDrive = d;
        }

        // spring-damper torque that rotates body.up back toward world up
        void ApplyUpright(Rigidbody rb, float k)
        {
            if (k <= 0.001f || rb.isKinematic) return;
            Quaternion delta = Quaternion.FromToRotation(rb.transform.up, Vector3.up);
            delta.ToAngleAxis(out float angle, out Vector3 axis);
            if (angle > 180f) angle -= 360f;
            if (Mathf.Abs(angle) < 0.01f || float.IsInfinity(axis.x) || float.IsNaN(axis.x)) axis = Vector3.zero;
            Vector3 w = rb.angularVelocity; w.y *= 0.2f;   // leave most of the yaw alone: that is the walking turn
            Vector3 torque = axis.normalized * (angle * Mathf.Deg2Rad * uprightSpring * k) - w * (uprightDamper * k);
            rb.AddTorque(torque, ForceMode.Acceleration);   // mass-independent, so heavy torsos still whip
        }

        Vector3 Goal => target ? target.position : targetPosition;

        void DynamicMove(float dt)
        {
            float control = IsKnockedOut ? 0f : IsStumbling ? 0.35f : IsRecovering ? 0.5f : 1f;
            if (control <= 0f) return;
            Vector3 to = Goal - pelvisRb.position; to.y = 0f;
            float dist = to.magnitude;
            Vector3 v = ComedyPhysicsCompat.GetVelocity(pelvisRb); v.y = 0f;
            Vector3 wanted = dist > arriveRadius ? to / dist * maxSpeed * Mathf.Clamp01(dist / (arriveRadius * 3f)) : Vector3.zero;
            Vector3 accel = Vector3.ClampMagnitude((wanted - v) * moveGain, maxMoveAccel);
            pelvisRb.AddForce(accel * control, ForceMode.Acceleration);

            if (dist > arriveRadius)
            {   // turn toward the walking direction
                Vector3 fwd = pelvisRb.transform.forward; fwd.y = 0f;
                float yawErr = Vector3.SignedAngle(fwd, to, Vector3.up) * Mathf.Deg2Rad;
                pelvisRb.AddTorque(Vector3.up * ((yawErr * turnSpring - pelvisRb.angularVelocity.y * turnDamper) * control), ForceMode.Acceleration);
            }
        }

        // cheap movement for far agents: kinematic slide toward the goal
        void KinematicMove(float dt, bool moveTorso)
        {
            Vector3 to = Goal - pelvisRb.position; to.y = 0f;
            float dist = to.magnitude;
            if (dist > arriveRadius)
            {
                Vector3 step = to / dist * Mathf.Min(dist, maxSpeed * dt);
                pelvisRb.MovePosition(pelvisRb.position + step);
                pelvisRb.MoveRotation(Quaternion.RotateTowards(pelvisRb.rotation, Quaternion.LookRotation(to / dist, Vector3.up), 360f * dt));
            }
            if (moveTorso) KinematicTorso();
        }

        void KinematicTorso()
        {
            torsoRb.MovePosition(pelvisRb.transform.TransformPoint(torsoLocalPos));
            torsoRb.MoveRotation(pelvisRb.rotation * torsoLocalRot);
        }

        void SetLowDamping(bool on)
        {
            lowDamping = on;
            ComedyPhysicsCompat.SetAngularDamping(pelvisRb, on ? fallenAngularDamping : pelvisBaseAngDamp);
            ComedyPhysicsCompat.SetAngularDamping(torsoRb, on ? fallenAngularDamping : torsoBaseAngDamp);
        }

        // ================= level of detail (step 3) =================
        /// <summary>0 full physics · 1 dynamic pelvis + kinematic torso (joint off) · 2 everything kinematic.</summary>
        internal void SetLod(int lod)
        {
            if (lod == Lod) return;
            if (lod == 0)
            {   // snap the torso back onto the pelvis and give it the pelvis' motion before the joint takes over
                Vector3 v = pelvisRb.isKinematic ? Vector3.zero : ComedyPhysicsCompat.GetVelocity(pelvisRb);
                pelvisRb.isKinematic = false; pelvisRb.constraints = pelvisBaseConstraints;
                torsoRb.position = pelvisRb.transform.TransformPoint(torsoLocalPos);
                torsoRb.rotation = pelvisRb.rotation * torsoLocalRot;
                torsoRb.isKinematic = false;
                ComedyPhysicsCompat.SetVelocity(torsoRb, v); ComedyPhysicsCompat.SetVelocity(pelvisRb, v);
                joint.xMotion = joint.yMotion = joint.zMotion = ConfigurableJointMotion.Locked;
                appliedStiffness = -1f;   // force a drive refresh
            }
            else
            {
                // far away the secondary body is not simulated: the joint is released and the torso just follows
                joint.xMotion = joint.yMotion = joint.zMotion = ConfigurableJointMotion.Free;
                torsoRb.isKinematic = true;
                knockoutTimer = stumbleTimer = 0f; recoverTimer = 999f; Balance = 1f;
                if (lowDamping) SetLowDamping(false);
                if (lod == 1)
                {
                    pelvisRb.isKinematic = false;
                    pelvisRb.constraints = pelvisBaseConstraints | RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationZ;
                    pelvisRb.rotation = Quaternion.Euler(0f, pelvisRb.rotation.eulerAngles.y, 0f);
                }
                else
                {
                    pelvisRb.isKinematic = true;
                    pelvisRb.rotation = Quaternion.Euler(0f, pelvisRb.rotation.eulerAngles.y, 0f);
                }
            }
            Lod = lod;
        }
    }
}
