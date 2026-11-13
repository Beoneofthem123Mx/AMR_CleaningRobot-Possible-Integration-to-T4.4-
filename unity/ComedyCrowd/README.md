# ComedyCrowd · wobbly two-body crowd physics for Unity

Standalone C# scripts (not used by the three.js game in `game/`). Copy `Scripts/` into a Unity project
(2021.3 LTS, 2022 LTS or Unity 6; the API renames of Unity 6 are handled in `ComedyPhysicsCompat.cs`).

Status: compiled against stand-ins of the UnityEngine API in both Unity 2022 and Unity 6 modes; not yet
run inside the Unity editor, so the default numbers below are starting points to tune.

## What is in here

| Script | Step | What it does |
|---|---|---|
| `ComedyAgentPhysics.cs` | 1, 2 | Pelvis pushed toward a target with forces; heavier torso on a `ConfigurableJoint` (slerp drive); spring-damper **upright torque**; `ApplyKnockout(duration)`; hard bumps start a 1.5 s **Stumble** (joint at half stiffness, random sideways shove, curve-driven recovery); falling agents pass part of the hit on (**domino**). |
| `ComedyCollisionRelay.cs` | 2 | Forwards collisions from the pelvis and torso bodies to the agent (added automatically). |
| `CrowdPhysicsManager.cs` | 3 | One `FixedUpdate` for the whole crowd and a distance level of detail: LOD 0 full physics, LOD 1 kinematic torso with its joint released, LOD 2 fully kinematic. Created automatically. |
| `ComedyCrowdDemo.cs` | — | Empty scene → add to a GameObject → Play: floor, a wall with a narrow gap, 150 primitive agents with googly eyes swapping sides, and a bowling ball every 6 s. |
| `ComedyPhysicsCompat.cs` | — | `velocity`/`linearVelocity`, `angularDrag`/`angularDamping`, `FindObjectOfType`/`FindFirstObjectByType`. |

## Agent setup

```
Agent              ← ComedyAgentPhysics (pelvisRb, torsoRb, joint)
 ├─ Pelvis         ← Rigidbody + Capsule collider
 └─ Torso          ← Rigidbody + Sphere/Capsule collider + ConfigurableJoint (connected body: Pelvis)
```

Pelvis and torso are siblings under a root without a Rigidbody. The script configures the joint
(linear motion locked, rotation free, slerp drive) in `Awake`. Call `SetTarget(position)` or assign
`target`; call `ApplyKnockout(seconds)` from your own hits (explosions, vehicles…).

## Calibrating the comedy in the Inspector

- **Top-heavy bodies**: `applyComedyMass` with `torsoMassRatio` 1.3–1.6. Quick turns whip the torso around.
- **Low angular drag while falling**: `fallenAngularDamping` 0.02–0.1 makes stumbling agents spin and roll
  before they stop; the normal damping comes back once they recover.
- **Soft elastic contacts**: `applyBouncyMaterial` with `bounciness` 0.15–0.25, so packed bodies in a
  bottleneck bounce off each other instead of sticking.
- **Balance**: `uprightSpring` 100–200 and `uprightDamper` 10–20. A lower spring gives more wobble, and a
  damper under ~8 makes them overshoot and sway.
- **How easily they fall**: `stumbleImpact` (≈3–4 m/s) and `knockoutImpact` (≈8–10 m/s). `dominoTransfer`
  0.5–0.8 for long chain reactions.
- **Recovery feel**: shape `stumbleRecovery` (slow start = they flail longer).
- **Performance**: `fullDetailDistance` / `simpleDistance` on the manager; `lodSlices` spreads the LOD
  checks over several physics steps. Put walls on their own layer and set `wallLayers` so random props
  don't trigger stumbles.
