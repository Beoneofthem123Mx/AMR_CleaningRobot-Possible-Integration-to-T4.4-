using UnityEngine;

namespace ComedyCrowd
{
    /// <summary>
    /// Sits on the pelvis and on the torso (each has its own Rigidbody and collider) and forwards their
    /// collisions to the agent root, so one script sees every bump. Added automatically by ComedyAgentPhysics.
    /// </summary>
    [DisallowMultipleComponent]
    public class ComedyCollisionRelay : MonoBehaviour
    {
        [HideInInspector] public ComedyAgentPhysics agent;

        void OnCollisionEnter(Collision collision)
        {
            if (agent) agent.HandleCollision(collision);
        }
    }
}
