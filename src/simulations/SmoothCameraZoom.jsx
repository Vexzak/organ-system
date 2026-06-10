import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const DEFAULT_TARGET = [0, 0, 0]

export default function SmoothCameraZoom({
  command,
  minDistance = 0.45,
  maxDistance = 12,
  zoomFactor = 0.65,
  target = DEFAULT_TARGET,
  smoothness = 8,
}) {
  const { camera, controls } = useThree()
  const targetVector = useMemo(() => new THREE.Vector3(...target), [target])
  const desiredDistanceRef = useRef(null)
  const lastCommandIdRef = useRef(null)

  useEffect(() => {
    if (!command) return
    if (lastCommandIdRef.current === command.id) return
    lastCommandIdRef.current = command.id

    const distance = desiredDistanceRef.current ?? camera.position.distanceTo(targetVector)
    const nextDistance =
      command.direction === "in"
        ? distance * zoomFactor
        : distance / zoomFactor

    desiredDistanceRef.current = THREE.MathUtils.clamp(nextDistance, minDistance, maxDistance)
  }, [camera, command, maxDistance, minDistance, targetVector, zoomFactor])

  useFrame((_, delta) => {
    const desiredDistance = desiredDistanceRef.current
    if (desiredDistance === null) return

    const offset = camera.position.clone().sub(targetVector)
    if (offset.lengthSq() < 0.000001) offset.set(0, 0, 1)

    const currentDistance = offset.length()
    const nextDistance = THREE.MathUtils.damp(
      currentDistance,
      desiredDistance,
      smoothness,
      delta
    )

    camera.position.copy(targetVector).add(offset.normalize().multiplyScalar(nextDistance))
    camera.lookAt(targetVector)

    if (controls) {
      controls.target.copy(targetVector)
      controls.update()
    }

    if (Math.abs(nextDistance - desiredDistance) < 0.002) {
      desiredDistanceRef.current = null
    }
  })

  return null
}
