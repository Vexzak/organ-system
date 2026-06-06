import { useRef, useEffect, useState, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import useAppStore from "../store/useAppStore"

const MESH_TO_ORGAN_ID = {
  abdominals:     "abdominals",
  biceps:         "biceps",
  deltoid:        "deltoid",
  Facial_Muscles: "facial_muscles",
  pectorals:      "pectorals",
  quadriceps:     "quadriceps",
}

const ORGAN_ID_TO_MESH = Object.fromEntries(
  Object.entries(MESH_TO_ORGAN_ID).map(([mesh, id]) => [id, mesh])
)

function CameraZoom({ zoomAction }) {
  const { camera } = useThree()
  useEffect(() => {
    if (!zoomAction) return
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    const step = zoomAction === "in" ? 0.4 : -0.4
    const next = camera.position.clone().addScaledVector(direction, step)
    const dist = next.length()
    if (dist >= 1.5 && dist <= 8) camera.position.copy(next)
  }, [zoomAction, camera])
  return null
}

function MuscularModel({ onSelect, selectedMesh, isSpinning }) {
  const { scene } = useGLTF("/muscular_system.glb")
  const materialsRef = useRef({})
  const groupRef = useRef()

  // Center the model
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.set(-center.x, -center.y, -center.z)
  }, [scene])

  // Clone materials and store original colors
  useEffect(() => {
    materialsRef.current = {}
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false
        child.receiveShadow = false
        child.material = child.material.clone()
        child.material.needsUpdate = true
        materialsRef.current[child.uuid] = {
          originalColor: child.material.color.clone(),
        }
      }
    })
  }, [scene])

  // Reset materials to original on unmount so GLB cache never carries stale colors
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
        }
      })
    }
  }, [scene])

  // Highlight selected mesh, reset all others
  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return
      const mat = child.material
      if (!mat) return
      const original = materialsRef.current[child.uuid]?.originalColor
      if (original) mat.color.copy(original)
      if (mat.emissive) {
        mat.emissive.set("#000000")
        mat.emissiveIntensity = 0
      }
    })

    if (!selectedMesh) return

    scene.traverse((child) => {
      if (!child.isMesh) return
      if (child.name !== selectedMesh) return
      const mat = child.material
      if (!mat) return
      mat.color.set("#3b82f6")
      if (mat.emissive) {
        mat.emissive.set("#3b82f6")
        mat.emissiveIntensity = 0.5
      }
    })
  }, [scene, selectedMesh])

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    const meshName = e.object.name
    if (meshName && MESH_TO_ORGAN_ID[meshName]) onSelect(meshName)
  }

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={(e) => {
          document.body.style.cursor = MESH_TO_ORGAN_ID[e.object.name] ? "pointer" : "default"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default"
        }}
      />
    </group>
  )
}

export default function MuscularSimulation({ system }) {
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

  const selectedMesh = currentOrgan ? ORGAN_ID_TO_MESH[currentOrgan.id] ?? null : null

  const handleSelect = (meshName) => {
    const organId = MESH_TO_ORGAN_ID[meshName]
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
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 14], fov: 35 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[-3, 6, 4]} intensity={1.3} color="#fff6e6" />
        <directionalLight position={[4, 2, -5]} intensity={0.6} color="#e8f5ff" />
        <pointLight position={[0, -3, 2]} intensity={0.5} color="#ffffff" />
        <Environment preset="sunset" environmentIntensity={0.45} />

        <CameraZoom zoomAction={zoomAction} />

        <MuscularModel
          onSelect={handleSelect}
          selectedMesh={selectedMesh}
          isSpinning={isSpinning}
        />
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={18}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
}