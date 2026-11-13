using UnityEngine;

namespace ComedyCrowd
{
    /// <summary>
    /// Drop on an empty GameObject in an empty scene and press Play: builds a floor, a wall with a narrow
    /// gap, and a crowd of primitive comedy agents that keep swapping sides through the bottleneck.
    /// Every few seconds (or with Space, if the old Input Manager is enabled) a bowling ball rolls through
    /// the crowd to show stumbles, knockouts and the domino effect.
    /// </summary>
    public class ComedyCrowdDemo : MonoBehaviour
    {
        [Header("Crowd")]
        public int count = 150;
        public float spawnRadius = 10f;
        public Vector3 goalA = new Vector3(0f, 0f, 14f);
        public Vector3 goalB = new Vector3(0f, 0f, -14f);
        [Tooltip("Seconds between swapping everyone's goal (they all cross the gap again).")]
        public float switchEvery = 9f;

        [Header("Arena")]
        public bool buildFloor = true;
        public bool buildBottleneck = true;
        public float gapWidth = 3f;
        public bool placeCamera = true;

        [Header("Chaos")]
        [Tooltip("A heavy ball is rolled through the crowd every N seconds (0 = never).")]
        public float ballEvery = 6f;
        public float ballSpeed = 14f;

        ComedyAgentPhysics[] agents;
        float switchTimer, ballTimer;
        bool towardA = true;

        void Start()
        {
            if (buildFloor)
            {
                var floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
                floor.name = "Floor"; floor.transform.localScale = new Vector3(8f, 1f, 8f);
                floor.GetComponent<Renderer>().material.color = new Color(.85f, .82f, .75f);
            }
            if (buildBottleneck)
                foreach (float side in new[] { -1f, 1f })
                {
                    var wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    wall.name = "Wall"; float w = 20f - gapWidth / 2f;
                    wall.transform.position = new Vector3(side * (gapWidth / 2f + w / 2f), 1f, 0f);
                    wall.transform.localScale = new Vector3(w, 2f, .6f);
                    wall.GetComponent<Renderer>().material.color = new Color(.95f, .76f, .2f);
                }
            if (placeCamera && Camera.main)
            {
                Camera.main.transform.position = new Vector3(0f, 22f, -26f);
                Camera.main.transform.LookAt(Vector3.zero);
            }

            agents = new ComedyAgentPhysics[count];
            for (int i = 0; i < count; i++)
            {
                Vector2 r = Random.insideUnitCircle * spawnRadius;
                agents[i] = CreateAgent(goalB + new Vector3(r.x, 0f, r.y), Color.HSVToRGB(Random.value, .65f, .95f));
            }
            SetGoals();
        }

        void Update()
        {
            switchTimer += Time.deltaTime;
            if (switchTimer > switchEvery) { switchTimer = 0f; towardA = !towardA; SetGoals(); }

            ballTimer += Time.deltaTime;
            bool launch = ballEvery > 0f && ballTimer > ballEvery;
#if ENABLE_LEGACY_INPUT_MANAGER
            if (Input.GetKeyDown(KeyCode.Space)) launch = true;
#endif
            if (launch) { ballTimer = 0f; LaunchBall(); }
        }

        void SetGoals()
        {
            foreach (var a in agents)
            {
                if (!a) continue;
                Vector2 r = Random.insideUnitCircle * spawnRadius * .8f;
                a.SetTarget((towardA ? goalA : goalB) + new Vector3(r.x, 0f, r.y));
            }
        }

        void LaunchBall()
        {
            var ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            ball.name = "BowlingBall"; ball.transform.localScale = Vector3.one * 1.4f;
            float side = Random.value < .5f ? -1f : 1f, z = Random.Range(-12f, 12f);
            ball.transform.position = new Vector3(side * 22f, .8f, z);
            ball.GetComponent<Renderer>().material.color = new Color(.15f, .15f, .2f);
            var rb = ball.AddComponent<Rigidbody>(); rb.mass = 40f;
            rb.AddForce(new Vector3(-side * ballSpeed, 0f, Random.Range(-1f, 1f)), ForceMode.VelocityChange);
            Destroy(ball, 10f);
        }

        // a primitive comedy agent: capsule pelvis, heavier sphere torso with googly eyes, joined by a ConfigurableJoint
        ComedyAgentPhysics CreateAgent(Vector3 pos, Color col)
        {
            var root = new GameObject("ComedyAgent");
            root.SetActive(false);   // so the agent's Awake runs after its fields are filled in
            root.transform.position = pos;

            var pelvis = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            pelvis.name = "Pelvis"; pelvis.transform.SetParent(root.transform, false);
            pelvis.transform.localPosition = new Vector3(0f, .55f, 0f); pelvis.transform.localScale = new Vector3(.5f, .55f, .5f);
            pelvis.GetComponent<Renderer>().material.color = col * .7f;
            var prb = pelvis.AddComponent<Rigidbody>(); prb.interpolation = RigidbodyInterpolation.Interpolate;

            var torso = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            torso.name = "Torso"; torso.transform.SetParent(root.transform, false);
            torso.transform.localPosition = new Vector3(0f, 1.45f, 0f); torso.transform.localScale = Vector3.one * .75f;
            torso.GetComponent<Renderer>().material.color = col;
            var trb = torso.AddComponent<Rigidbody>(); trb.interpolation = RigidbodyInterpolation.Interpolate;
            foreach (float s in new[] { -1f, 1f })
            {   // googly eyes (no colliders)
                var eye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                Destroy(eye.GetComponent<Collider>());
                eye.transform.SetParent(torso.transform, false);
                eye.transform.localPosition = new Vector3(s * .18f, .12f, .42f); eye.transform.localScale = Vector3.one * .22f;
                eye.GetComponent<Renderer>().material.color = Color.white;
                var pupil = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                Destroy(pupil.GetComponent<Collider>());
                pupil.transform.SetParent(eye.transform, false);
                pupil.transform.localPosition = new Vector3(0f, 0f, .38f); pupil.transform.localScale = Vector3.one * .5f;
                pupil.GetComponent<Renderer>().material.color = Color.black;
            }

            var joint = torso.AddComponent<ConfigurableJoint>();
            joint.connectedBody = prb;
            joint.anchor = new Vector3(0f, -.6f, 0f);   // bottom of the torso sphere, in its local space

            var agent = root.AddComponent<ComedyAgentPhysics>();
            agent.pelvisRb = prb; agent.torsoRb = trb; agent.joint = joint;
            agent.maxSpeed = Random.Range(2.4f, 3.6f);
            root.SetActive(true);
            return agent;
        }
    }
}
