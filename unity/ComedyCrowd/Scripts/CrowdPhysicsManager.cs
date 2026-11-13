using System.Collections.Generic;
using UnityEngine;

namespace ComedyCrowd
{
    /// <summary>
    /// Step 3: one FixedUpdate for the whole crowd instead of hundreds of per-agent ones, plus a
    /// distance-based level of detail:
    ///   LOD 0 (near)  full two-body physics, joint, balance torque, stumbles and knockouts;
    ///   LOD 1 (mid)   the pelvis is still simulated (rotation locked upright), the torso is kinematic and
    ///                 its joint is released, so the secondary body costs almost nothing;
    ///   LOD 2 (far)   both bodies kinematic, slid toward their goal (no contacts between far agents).
    /// LOD is re-evaluated for a slice of the crowd each physics step, with hysteresis so agents near a
    /// boundary don't flicker between levels. Created automatically if the scene has none.
    /// </summary>
    [DefaultExecutionOrder(-50)]
    public class CrowdPhysicsManager : MonoBehaviour
    {
        public static CrowdPhysicsManager Instance { get; private set; }

        [Tooltip("Camera used for the level of detail. Camera.main if empty.")]
        public Camera viewCamera;
        [Tooltip("Agents closer than this get full physics.")]
        public float fullDetailDistance = 30f;
        [Tooltip("Agents closer than this keep a simulated pelvis; beyond it they are fully kinematic.")]
        public float simpleDistance = 70f;
        [Tooltip("Extra meters before an agent drops to a cheaper level (avoids flicker).")]
        public float hysteresis = 4f;
        [Tooltip("The LOD of the whole crowd is refreshed over this many physics steps.")]
        [Min(1)] public int lodSlices = 10;
        [Tooltip("Turn the LOD off (everyone at full physics), e.g. for a cinematic.")]
        public bool lodEnabled = true;

        public int AgentCount => agents.Count;
        public int CountAtLod(int lod) { int n = 0; foreach (var a in agents) if (a.Lod == lod) n++; return n; }

        readonly List<ComedyAgentPhysics> agents = new List<ComedyAgentPhysics>(512);
        int lodCursor;

        public static void Register(ComedyAgentPhysics agent)
        {
            if (!Application.isPlaying || agent.managerIndex >= 0) return;
            Ensure();
            agent.managerIndex = Instance.agents.Count;
            Instance.agents.Add(agent);
        }

        public static void Unregister(ComedyAgentPhysics agent)
        {
            if (!Instance || agent.managerIndex < 0) return;
            var list = Instance.agents;
            int i = agent.managerIndex, last = list.Count - 1;
            if (i <= last && list[i] == agent)
            {   // swap-remove keeps it O(1)
                list[i] = list[last]; list[i].managerIndex = i; list.RemoveAt(last);
            }
            agent.managerIndex = -1;
        }

        static void Ensure()
        {
            if (Instance) return;
            Instance = ComedyPhysicsCompat.FindAnyObject<CrowdPhysicsManager>();
            if (!Instance) Instance = new GameObject("CrowdPhysicsManager").AddComponent<CrowdPhysicsManager>();
        }

        void Awake()
        {
            if (Instance && Instance != this) { Destroy(this); return; }
            Instance = this;
        }

        void OnDestroy() { if (Instance == this) Instance = null; }

        void FixedUpdate()
        {
            int n = agents.Count;
            if (n == 0) return;
            float dt = Time.fixedDeltaTime;

            // refresh the level of detail for one slice of the crowd
            var cam = viewCamera ? viewCamera : Camera.main;
            if (lodEnabled && cam)
            {
                Vector3 camPos = cam.transform.position;
                int slice = Mathf.Max(1, Mathf.CeilToInt(n / (float)lodSlices));
                for (int k = 0; k < slice; k++)
                {
                    lodCursor = (lodCursor + 1) % n;
                    var a = agents[lodCursor];
                    float d = Vector3.Distance(a.pelvisRb.position, camPos);
                    // step down only past boundary + hysteresis, step up as soon as the agent is back inside
                    int lod = a.Lod;
                    if (lod == 0 && d > fullDetailDistance + hysteresis) lod = 1;
                    else if (lod >= 1 && d < fullDetailDistance) lod = 0;
                    if (lod == 1 && d > simpleDistance + hysteresis) lod = 2;
                    else if (lod == 2 && d < simpleDistance) lod = 1;
                    a.SetLod(lod);
                }
            }
            else for (int i = 0; i < n; i++) agents[i].SetLod(0);

            // one loop for every agent's movement and balance forces
            for (int i = 0; i < n; i++) agents[i].Tick(dt);
        }
    }
}
