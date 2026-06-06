import { useRef, useEffect, useState, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import useAppStore from "../store/useAppStore"

const BONE_TO_ORGAN_ID = {
  Skull:      "skull",
  Spine:      "spine",
  Rib_Cage:   "rib_cage",
  Hand_Bones: "hand_bones",
  Leg_Bones:  "leg_bones",
}

function findBoneName(object) {
  let current = object
  while (current) {
    if (BONE_TO_ORGAN_ID[current.name]) return current.name
    current = current.parent
  }
  return null
}

function CameraZoom({ zoomAction }) {
  const { camera } = useThree()
  useEffect(() => {
    if (!zoomAction) return
    const nextZoom = zoomAction === "in" ? camera.zoom * 10 : camera.zoom / 10
    camera.zoom = Math.min(25, Math.max(0.2, nextZoom))
    camera.updateProjectionMatrix()
  }, [zoomAction, camera])
  return null
}

function SkeletalModel({ onSelect, selectedBone, isSpinning }) {
  const MODEL_SCALE = 1.45
  const { scene } = useGLTF("https://drive.google.com/uc?export=download&id=1_1qPSA3_hFeLny00yH1CeFr43YdjxrcD")
  const materialsRef = useRef({})
  const groupRef = useRef()

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.set(-center.x, -center.y, -center.z)
  }, [scene])

  useEffect(() => {
    materialsRef.current = {}
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = child.material.clone()
        // Tone down the brightness — 1.9 was too high
        if (child.material.color) child.material.color.multiplyScalar(1.1)
        // Add roughness for more realistic bone look
        if ('roughness' in child.material) child.material.roughness = 0.75
        if ('metalness' in child.material) child.material.metalness = 0.05
        child.material.needsUpdate = true
        materialsRef.current[child.uuid] = {
          originalColor: child.material.color.clone(),
        }
      }
    })
  }, [scene])

  // Reset materials on unmount so GLB cache never carries stale colors
  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (!child.isMesh) return
        const mat = child.material
        const original = materialsRef.current[child.uuid]?.originalColor
        if (mat && original) {
          mat.color.copy(original)
          if (mat.emissive) {
            mat.emissive.set("#000000")
            mat.emissiveIntensity = 0
          }
          mat.needsUpdate = true
        }
      })
    }
  }, [scene])

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material
        if (!mat) return
        const original = materialsRef.current[child.uuid]?.originalColor
        if (original) mat.color.copy(original)
        if (mat.emissive) {
          mat.emissive.set("#000000")
          mat.emissiveIntensity = 0
        }
      }
    })

    if (!selectedBone) return
    scene.traverse((child) => {
      if (child.isMesh) {
        const boneName = findBoneName(child)
        if (boneName === selectedBone) {
          const mat = child.material
          if (!mat) return
          mat.color.set("#3b82f6")
          if (mat.emissive) {
            mat.emissive.set("#3b82f6")
            mat.emissiveIntensity = 0.5
          }
        }
      }
    })
  }, [scene, selectedBone])

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    const boneName = findBoneName(e.object)
    if (boneName) onSelect(boneName)
  }

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]}
        onClick={handleClick}
        onPointerOver={(e) => {
          const boneName = findBoneName(e.object)
          document.body.style.cursor = boneName ? "pointer" : "default"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default"
        }}
      />
    </group>
  )
}

export default function SkeletalSimulation({ system }) {
  const { currentOrgan, setCurrentOrgan } = useAppStore()
  const [isSpinning] = useState(true)
  const [zoomAction, setZoomAction] = useState(null)
  const zoomTimerRef = useRef(null)

  const triggerZoom = useCallback((direction) => {
    setZoomAction(direction)
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => setZoomAction(null), 50)
  }, [])

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    }
  }, [])

  const selectedBone = currentOrgan
    ? Object.entries(BONE_TO_ORGAN_ID).find(([, id]) => id === currentOrgan.id)?.[0] ?? null
    : null

  const handleSelect = (boneName) => {
    const organId = BONE_TO_ORGAN_ID[boneName]
    if (!organId || !system) return
    const organ = system.organs.find((o) => o.id === organId)
    if (organ) setCurrentOrgan(organ)
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: 570 }}>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => triggerZoom("in")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold transition-all duration-150 select-none"
          style={{
            background: 'rgba(59,130,246,0.18)',
            border: '1.5px solid rgba(59,130,246,0.30)',
            color: '#2563eb',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => triggerZoom("out")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold transition-all duration-150 select-none"
          style={{
            background: 'rgba(59,130,246,0.18)',
            border: '1.5px solid rgba(59,130,246,0.30)',
            color: '#2563eb',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Zoom out"
        >−</button>
      </div>

      <Canvas
        shadows
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 3.3], fov: 45 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        {/* Soft ambient — much lower so shadows are visible */}
        <ambientLight intensity={0.4} />

        {/* Key light — main shadow caster from upper left */}
        <directionalLight
          castShadow
          position={[-4, 8, 5]}
          intensity={1.4}
          color="#fff8f0"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0005}
        />

        {/* Fill light — softer, from right */}
        <directionalLight
          position={[5, 2, -3]}
          intensity={0.5}
          color="#dceeff"
        />

        {/* Subtle rim light from behind/below for depth */}
        <pointLight position={[0, -4, -3]} intensity={0.3} color="#c8e0ff" />

        <Environment preset="dawn" environmentIntensity={0.3} />

        <CameraZoom zoomAction={zoomAction} />

        <SkeletalModel
          onSelect={handleSelect}
          selectedBone={selectedBone}
          isSpinning={isSpinning}
        />
        <OrbitControls
          enablePan={false}
          minDistance={2.0}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
}