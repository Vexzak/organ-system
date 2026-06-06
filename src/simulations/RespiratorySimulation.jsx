import { useRef, useEffect, useState, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import useAppStore from "../store/useAppStore"

const MESH_TO_ORGAN_ID = {
  Body_L_13:  "body",
  bronchi:    "bronchi",
  diaphragm:  "diaphragm",
  lungs:      "lungs",
  nose:       "nose",
  trachea:    "trachea",
}

const BREATHING_ANIMATIONS = [
  "diaphragmAction", "lungsAction", "bronchiAction",
  "SphereAction", "Sphere.001Action", "Sphere.003Action", "Sphere.004Action", "Sphere.005Action",
]

const TRANSPARENT_SHELLS = new Set(["Body_L_13", "lungs"])
const BLUE = new THREE.Color('#3b82f6')

function findOrganName(object) {
  let current = object
  while (current) {
    if (MESH_TO_ORGAN_ID[current.name]) return current.name
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

function RespiratoryModel({ onSelect, selectedOrgan, isSpinning }) {
  const { scene, animations } = useGLTF("https://github.com/Vexzak/organ-system/releases/download/v1.0/respiratory_system.glb")
  const originalColorsRef = useRef({})
  const groupRef = useRef()
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    BREATHING_ANIMATIONS.forEach((name) => {
      const action = actions[name]
      if (!action) return
      action.reset()
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.clampWhenFinished = false
      action.play()
    })
  }, [actions])

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    scene.scale.setScalar(2 / maxDim)
    const box2 = new THREE.Box3().setFromObject(scene)
    const center2 = new THREE.Vector3()
    box2.getCenter(center2)
    scene.position.set(-center2.x, -center2.y, -center2.z)
  }, [scene])

  useEffect(() => {
    originalColorsRef.current = {}

    // Pass 1: inner organs — opaque
    scene.traverse((child) => {
      if (!child.isMesh) return
      const organName = findOrganName(child)
      if (!organName || TRANSPARENT_SHELLS.has(organName)) return
      child.material = child.material.clone()
      child.castShadow = false
      child.receiveShadow = false
      if (child.material.color) child.material.color.multiplyScalar(1.1)
      child.material.transparent = false
      child.material.opacity = 1.0
      child.material.depthTest = true
      child.material.depthWrite = true
      child.material.side = THREE.FrontSide
      child.material.needsUpdate = true
      child.renderOrder = organName === "bronchi" ? 3 : 0
      originalColorsRef.current[child.uuid] = child.material.color.clone()
    })

    // Pass 2: lungs — semi-transparent
    scene.traverse((child) => {
      if (!child.isMesh) return
      if (findOrganName(child) !== "lungs") return
      const oldMat = child.material
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff),
        map: oldMat.map ?? null, normalMap: oldMat.normalMap ?? null,
        roughnessMap: oldMat.roughnessMap ?? null, metalnessMap: oldMat.metalnessMap ?? null,
        aoMap: oldMat.aoMap ?? null,
        transparent: true, opacity: 0.45, depthWrite: false, depthTest: true,
        side: THREE.FrontSide, roughness: 0.5, metalness: 0.0,
      })
      if (oldMat.dispose) oldMat.dispose()
      child.material.needsUpdate = true
      child.renderOrder = 1
      originalColorsRef.current[child.uuid] = new THREE.Color(0xffffff)
    })

    // Pass 3: body skin — outermost transparent
    scene.traverse((child) => {
      if (!child.isMesh) return
      if (findOrganName(child) !== "Body_L_13") return
      const oldMat = child.material
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x88aacc),
        map: oldMat.map ?? null, normalMap: oldMat.normalMap ?? null,
        transparent: true, opacity: 0.18, depthWrite: false, depthTest: true,
        side: THREE.FrontSide, roughness: 0.3, metalness: 0.05,
      })
      if (oldMat.dispose) oldMat.dispose()
      child.material.needsUpdate = true
      child.renderOrder = 4
    })
  }, [scene])

  // Reset materials on unmount so GLB cache never carries stale colors
  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (!child.isMesh) return
        const mat = child.material
        const original = originalColorsRef.current[child.uuid]
        if (mat && original) {
          mat.color.copy(original)
          if (mat.emissive) {
            mat.emissive.set("#000000")
            mat.emissiveIntensity = 0
          }
          if (TRANSPARENT_SHELLS.has(findOrganName(child))) {
            const organName = findOrganName(child)
            mat.opacity = organName === "lungs" ? 0.45 : 0.18
          }
          mat.needsUpdate = true
        }
      })
    }
  }, [scene])

  // Two-pass highlight: reset ALL first, then apply selected
  useEffect(() => {
    // Pass 1: reset all to original
    scene.traverse((child) => {
      if (!child.isMesh) return
      const organName = findOrganName(child)
      if (!organName) return
      const mat = child.material
      const orig = originalColorsRef.current[child.uuid]
      if (orig) mat.color.copy(orig)
      if (TRANSPARENT_SHELLS.has(organName)) {
        mat.opacity = organName === "lungs" ? 0.45 : 0.18
      }
      if (mat.emissive) { mat.emissive.set('#000000'); mat.emissiveIntensity = 0 }
      mat.needsUpdate = true
    })

    // Pass 2: highlight selected only
    if (!selectedOrgan) return
    scene.traverse((child) => {
      if (!child.isMesh) return
      const organName = findOrganName(child)
      if (organName !== selectedOrgan) return
      const mat = child.material
      const isShell = TRANSPARENT_SHELLS.has(organName)
      mat.color.copy(BLUE)
      if (isShell) mat.opacity = organName === "lungs" ? 0.5 : 0.28
      if (mat.emissive) { mat.emissive.copy(BLUE); mat.emissiveIntensity = 0.45 }
      mat.needsUpdate = true
    })
  }, [scene, selectedOrgan])

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) groupRef.current.rotation.y += delta * 0.3
  })

  const handleClick = (e) => {
    e.stopPropagation()
    for (const hit of (e.intersections ?? [])) {
      const organName = findOrganName(hit.object)
      if (organName && organName !== "Body_L_13") { onSelect(organName); return }
    }
  }

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={(e) => {
          const found = (e.intersections ?? []).some((hit) => {
            const n = findOrganName(hit.object)
            return n && n !== "Body_L_13"
          })
          document.body.style.cursor = found ? "pointer" : "default"
        }}
        onPointerOut={() => { document.body.style.cursor = "default" }}
      />
    </group>
  )
}

export default function RespiratorySimulation({ system }) {
  const { currentOrgan, setCurrentOrgan } = useAppStore()
  const [isSpinning, setIsSpinning] = useState(true)
  const spinResumeTimerRef = useRef(null)
  const [zoomAction, setZoomAction] = useState(null)
  const zoomTimerRef = useRef(null)

  const handleOrbitStart = useCallback(() => {
    setIsSpinning(false)
    if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current)
  }, [])

  const handleOrbitEnd = useCallback(() => {
    if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current)
    spinResumeTimerRef.current = setTimeout(() => setIsSpinning(true), 1500)
  }, [])

  const triggerZoom = useCallback((direction) => {
    setIsSpinning(false)
    if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current)
    setZoomAction(direction)
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => setZoomAction(null), 50)
    spinResumeTimerRef.current = setTimeout(() => setIsSpinning(true), 1500)
  }, [])

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current)
    }
  }, [])

  const selectedOrgan = currentOrgan
    ? Object.entries(MESH_TO_ORGAN_ID).find(([, id]) => id === currentOrgan.id)?.[0] ?? null
    : null

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
        shadows
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        gl={{ alpha: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight castShadow position={[-3, 6, 4]} intensity={1.2} color="#fff6e6"
          shadow-mapSize={[1024, 1024]} shadow-camera-near={0.5} shadow-camera-far={30}
          shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={6} shadow-camera-bottom={-6}
        />
        <directionalLight position={[4, 2, -5]} intensity={0.5} color="#e8f5ff" />
        <pointLight position={[0, -3, 2]} intensity={0.5} color="#ffffff" />
        <Environment preset="sunset" environmentIntensity={0.5} />
        <CameraZoom zoomAction={zoomAction} />
        <RespiratoryModel onSelect={handleSelect} selectedOrgan={selectedOrgan} isSpinning={isSpinning} />
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} target={[0, 0, 0]}
          onStart={handleOrbitStart} onEnd={handleOrbitEnd}
        />
      </Canvas>
    </div>
  )
}