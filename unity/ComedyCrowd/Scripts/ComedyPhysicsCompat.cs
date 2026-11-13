using UnityEngine;

namespace ComedyCrowd
{
    /// <summary>
    /// Small helpers so the scripts compile on Unity 2021/2022 LTS and on Unity 6,
    /// where Rigidbody.velocity became linearVelocity and angularDrag became angularDamping.
    /// </summary>
    internal static class ComedyPhysicsCompat
    {
#if UNITY_6000_0_OR_NEWER
        public static Vector3 GetVelocity(Rigidbody rb) => rb.linearVelocity;
        public static void SetVelocity(Rigidbody rb, Vector3 v) => rb.linearVelocity = v;
        public static float GetAngularDamping(Rigidbody rb) => rb.angularDamping;
        public static void SetAngularDamping(Rigidbody rb, float d) => rb.angularDamping = d;
#else
        public static Vector3 GetVelocity(Rigidbody rb) => rb.velocity;
        public static void SetVelocity(Rigidbody rb, Vector3 v) => rb.velocity = v;
        public static float GetAngularDamping(Rigidbody rb) => rb.angularDrag;
        public static void SetAngularDamping(Rigidbody rb, float d) => rb.angularDrag = d;
#endif

        public static T FindAnyObject<T>() where T : Object
        {
#if UNITY_2023_1_OR_NEWER
            return Object.FindFirstObjectByType<T>();
#else
            return Object.FindObjectOfType<T>();
#endif
        }
    }
}
