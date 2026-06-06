import { useRef, useEffect, useCallback, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import useAppStore from "../store/useAppStore"

const MESH_TO_ORGAN_ID = {
  heart_v2:              'heart',
  Blood_Vessel:          'blood_vessels',
  female_arteries_torso: 'blood_vessels',
}

function findOrganId(object) {
  let current = object
  while (current) {
    if (MESH_TO_ORGAN_ID[current.name]) return MESH_TO_ORGAN_ID[current.name]
    const partialKey = Object.keys(MESH_TO_ORGAN_ID).find(
      (k) => current.name && current.name.startsWith(k)
    )
    if (partialKey) return MESH_TO_ORGAN_ID[partialKey]
    current = current.parent
  }
  return null
}

const BLUE = new THREE.Color('#3b82f6')

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

function CirculatoryModel({ onSelect, selectedOrganId, isDragging, isSpinning }) {
  const { scene, animations } = useGLTF("https://ronvremnakncnmiphjkg.supabase.co/storage/v1/object/public/glb-files/circulatory_system.glb")
  const { raycaster } = useThree()
  const materialsRef = useRef({})
  const groupRef = useRef()
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      if (action) {
        action.reset()
        action.setLoop(THREE.LoopRepeat, Infinity)
        action.clampWhenFinished = false
        action.play()
      }
    })
  }, [actions])

  useEffect(() => {
    raycaster.params.Mesh.threshold = 0.1
  }, [raycaster])

  useEffect(() => {
    const box    = new THREE.Box3().setFromObject(scene)
    const centre = box.getCenter(new THREE.Vector3())
    const size   = box.getSize(new THREE.Vector3())
    scene.position.set(-centre.x, -centre.y, -centre.z)
    scene.scale.setScalar(1.8 / Math.max(size.x, size.y, size.z))
  }, [scene])

  useEffect(() => {
    materialsRef.current = {}
    scene.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = false
      child.receiveShadow = false
      child.material = child.material.clone()
      materialsRef.current[child.uuid] = {
        organId:       findOrganId(child),
        originalColor: child.material.color.clone(),
      }
    })
  }, [scene])

  // Reset materials on unmount so GLB cache never carries stale colors
  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (!child.isMesh) return
        const entry = materialsRef.current[child.uuid]
        const mat = child.material
        if (mat && entry?.originalColor) {
          mat.color.copy(entry.originalColor)
          if (mat.emissive !== undefined) {
            mat.emissive.set('#000000')
            mat.emissiveIntensity = 0
          }
          mat.needsUpdate = true
        }
      })
    }
  }, [scene])

  // Two-pass highlight: reset ALL first, then apply selected
  useEffect(() => {
    // Pass 1: reset all
    scene.traverse((child) => {
      if (!child.isMesh) return
      const entry = materialsRef.current[child.uuid]
      const mat   = child.material
      if (!mat || !entry) return
      mat.color.copy(entry.originalColor)
      if (mat.emissive !== undefined) {
        mat.emissive.set('#000000')
        mat.emissiveIntensity = 0
      }
      mat.needsUpdate = true
    })

    // Pass 2: highlight selected
    if (!selectedOrganId) return
    scene.traverse((child) => {
      if (!child.isMesh) return
      const entry = materialsRef.current[child.uuid]
      const mat   = child.material
      if (!mat || !entry) return
      if (entry.organId === selectedOrganId) {
        mat.color.copy(BLUE)
        if (mat.emissive !== undefined) {
          mat.emissive.copy(BLUE)
          mat.emissiveIntensity = 0.5
        }
        mat.needsUpdate = true
      }
    })
  }, [scene, selectedOrganId])

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (isDragging.current) return
    const organId = findOrganId(e.object)
    if (organId) onSelect(organId)
  }

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={(e) => {
          if (isDragging.current) return
          document.body.style.cursor = findOrganId(e.object) ? "pointer" : "default"
        }}
        onPointerOut={() => { document.body.style.cursor = "default" }}
      />
    </group>
  )
}

export default function CirculatorySimulation({ system }) {
  const { currentOrgan, setCurrentOrgan } = useAppStore()
  const isDragging   = useRef(false)
  const zoomTimerRef = useRef(null)
  const [zoomAction, setZoomAction] = useState(null)

  const selectedOrganId = currentOrgan?.id ?? null

  const handleSelect = (organId) => {
    if (!organId || !system) return
    const organ = system.organs.find((o) => o.id === organId)
    if (organ) setCurrentOrgan(organ)
  }

  const handlePointerDown = useCallback(() => { isDragging.current = true }, [])
  const handlePointerUp   = useCallback(() => { isDragging.current = false }, [])

  const triggerZoom = useCallback((direction) => {
    setZoomAction(direction)
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => setZoomAction(null), 50)
  }, [])

  useEffect(() => {
    return () => { if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current) }
  }, [])

  return (
    <div className="relative w-full h-full" style={{ minHeight: 570 }}>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => triggerZoom("in")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold transition-all duration-150 select-none"
          style={{ background: 'rgba(59,130,246,0.18)', border: '1.5px solid rgba(59,130,246,0.30)', color: '#2563eb', backdropFilter: 'blur(8px)' }}
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => triggerZoom("out")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold transition-all duration-150 select-none"
          style={{ background: 'rgba(59,130,246,0.18)', border: '1.5px solid rgba(59,130,246,0.30)', color: '#2563eb', backdropFilter: 'blur(8px)' }}
          aria-label="Zoom out"
        >−</button>
      </div>

      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[2, 4, 3]}  intensity={3.2} color="#fff6e6" />
        <directionalLight position={[-3, 1, -2]} intensity={1.2} color="#e8f5ff" />
        <directionalLight position={[0, -3, -2]} intensity={0.6} color="#ffffff" />
        <Environment preset="sunset" environmentIntensity={0.5} />
        <CameraZoom zoomAction={zoomAction} />
        <CirculatoryModel
          onSelect={handleSelect}
          selectedOrganId={selectedOrganId}
          isDragging={isDragging}
          isSpinning={true}
        />
        <OrbitControls enablePan={false} minDistance={0.5} maxDistance={8} target={[0, 0, 0]} />
      </Canvas>
    </div>
  )
}