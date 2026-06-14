import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import useAppStore from "../store/useAppStore"
import SmoothCameraZoom from "./SmoothCameraZoom"
import { speakOrgan } from '../hooks/useOrganSpeech'

const MESH_TO_ORGAN_ID = {
  mouth:                   "mouth",
  esophagus:               "esophagus",
  stomach:                 "stomach",
  small_intestine:         "small_intestine",
  large_intestine:   "large_intestine",  
}

// Never highlighted — transparent shells
const TRANSPARENT_SHELLS = new Set(["skin", "nothing"])

// Sphere helper nodes excluded from bounding-box
const SPHERE_NAMES = new Set([
  "Sphere","Sphere.001","Sphere.002","Sphere.003",
  "Sphere.004","Sphere.005","Sphere.006","Sphere.007","Sphere.008",
])

const BLUE      = new THREE.Color("#3b82f6")
const BLUE_EMIS = new THREE.Color("#1d4ed8")

const GLB_URL = "https://ronvremnakncnmiphjkg.supabase.co/storage/v1/object/public/glb-files/digestive_final.glb"

// ─── Name resolver ─────────────────────────────────────────────────────────────
// Walks the object and its parents to find a matching key.
function resolveKey(object) {
  let current = object
  while (current) {
    const n = current.name

    if (MESH_TO_ORGAN_ID[n] !== undefined) return n
    if (TRANSPARENT_SHELLS.has(n)) return n

    // Prefix match: catches "large_intestine.002" → base "large_intestine"
    const dotIdx = n.lastIndexOf(".")
    if (dotIdx !== -1) {
      const base = n.slice(0, dotIdx)
      if (MESH_TO_ORGAN_ID[base] !== undefined) return base
      if (TRANSPARENT_SHELLS.has(base)) return base
    }

    current = current.parent
  }
  return null
}

// ─── Model component ───────────────────────────────────────────────────────────
function DigestiveModel({ onSelect, selectedOrganId, isSpinning }) {
  const { scene, animations } = useGLTF(GLB_URL)
  const originalColorsRef = useRef({})
  const groupRef          = useRef()
  const offsetRef         = useRef()
  const mixerRef          = useRef(null)
  const recenterFramesRef = useRef(0)

  // Debug: log every mesh with resolved key
  useEffect(() => {
    console.group("=== DIGESTIVE SCENE MESHES ===")
    scene.traverse((child) => {
      if (!child.isMesh) return
      const key = resolveKey(child)
      console.log(`node:"${child.name}" | resolved:"${key}" | organId:"${MESH_TO_ORGAN_ID[key] ?? 'none'}"`)
    })
    console.groupEnd()
  }, [scene])

  // ── Centering ──────────────────────────────────────────────────────────────
  const centerModel = useCallback(() => {
    if (!offsetRef.current) return
    offsetRef.current.position.set(0, 0, 0)
    scene.position.set(0, 0, 0)
    scene.rotation.set(0, 0, 0)
    scene.scale.set(1, 1, 1)

    scene.updateWorldMatrix(true, true)
    const sceneInverse = scene.matrixWorld.clone().invert()

    const modelBox = new THREE.Box3()
    scene.traverse((child) => {
      if (!child.isMesh) return
      if (SPHERE_NAMES.has(child.name) || SPHERE_NAMES.has(child.parent?.name)) return
      child.geometry.computeBoundingBox()
      const meshToScene = sceneInverse.clone().multiply(child.matrixWorld)
      const geomBox = child.geometry.boundingBox.clone().applyMatrix4(meshToScene)
      modelBox.union(geomBox)
    })

    if (modelBox.isEmpty()) return

    const size   = new THREE.Vector3()
    const center = new THREE.Vector3()
    modelBox.getSize(size)
    modelBox.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim === 0) return

    const scale = 2 / maxDim
    scene.scale.setScalar(scale)
    offsetRef.current.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    )
  }, [scene])

  useLayoutEffect(() => {
    centerModel()
    recenterFramesRef.current = 8
    const f1 = requestAnimationFrame(centerModel)
    const f2 = requestAnimationFrame(() => requestAnimationFrame(centerModel))
    return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2) }
  }, [centerModel])

  // ── Animation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!animations?.length) return
    const mixer  = new THREE.AnimationMixer(scene)
    const action = mixer.clipAction(animations[0])
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()
    mixer.update(0)
    centerModel()
    recenterFramesRef.current = 8
    mixerRef.current = mixer
    return () => {
      action.stop()
      mixer.stopAllAction()
      mixer.uncacheRoot(scene)
      mixerRef.current = null
    }
  }, [scene, animations, centerModel])

  // ── Materials setup ────────────────────────────────────────────────────────
  useEffect(() => {
    originalColorsRef.current = {}

    scene.traverse((child) => {
      if (!child.isMesh) return
      const key = resolveKey(child)

      // Transparent shells
      if (key && TRANSPARENT_SHELLS.has(key)) {
        const old = child.material
        child.material = new THREE.MeshStandardMaterial({
          color:       new THREE.Color(0x88aacc),
          map:         old.map       ?? null,
          normalMap:   old.normalMap ?? null,
          transparent: true,
          opacity:     0.18,
          depthWrite:  false,
          depthTest:   true,
          side:        THREE.FrontSide,
          roughness:   0.3,
          metalness:   0.05,
        })
        if (old.dispose) old.dispose()
        child.material.needsUpdate = true
        child.renderOrder = 4
        return
      }

      // Organ meshes only
      if (!key || !MESH_TO_ORGAN_ID[key]) return

      child.material = child.material.clone()
      child.castShadow    = false
      child.receiveShadow = false
      Object.assign(child.material, {
        transparent: false,
        opacity:     1,
        depthTest:   true,
        depthWrite:  true,
        side:        THREE.FrontSide,
      })
      if (child.material.emissive) {
        child.material.emissive.set("#000000")
        child.material.emissiveIntensity = 0
      }
      child.material.needsUpdate = true
      child.renderOrder = 0

      originalColorsRef.current[child.uuid] = child.material.color.clone()
    })

    return () => {
      scene.traverse((child) => {
        if (!child.isMesh) return
        const orig = originalColorsRef.current[child.uuid]
        if (child.material && orig) {
          child.material.color.copy(orig)
          if (child.material.emissive) {
            child.material.emissive.set("#000000")
            child.material.emissiveIntensity = 0
          }
          child.material.needsUpdate = true
        }
      })
    }
  }, [scene])

  // ── Highlight ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Reset all to original
    scene.traverse((child) => {
      if (!child.isMesh) return
      const key = resolveKey(child)
      if (!key || TRANSPARENT_SHELLS.has(key) || !MESH_TO_ORGAN_ID[key]) return
      const orig = originalColorsRef.current[child.uuid]
      if (!child.material || !orig) return
      child.material.color.copy(orig)
      if (child.material.emissive) {
        child.material.emissive.set("#000000")
        child.material.emissiveIntensity = 0
      }
      child.material.needsUpdate = true
    })

    if (!selectedOrganId) return

    // Highlight selected
    scene.traverse((child) => {
      if (!child.isMesh) return
      const key = resolveKey(child)
      if (!key || TRANSPARENT_SHELLS.has(key)) return
      if (MESH_TO_ORGAN_ID[key] !== selectedOrganId) return
      if (!child.material) return
      child.material.color.copy(BLUE)
      if (child.material.emissive) {
        child.material.emissive.copy(BLUE_EMIS)
        child.material.emissiveIntensity = 0.55
      }
      child.material.needsUpdate = true
    })
  }, [scene, selectedOrganId])

  // ── Per-frame ──────────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) groupRef.current.rotation.y += delta * 0.3
    mixerRef.current?.update(delta)
    if (recenterFramesRef.current > 0) {
      centerModel()
      recenterFramesRef.current -= 1
    }
  })

  // ── Click ──────────────────────────────────────────────────────────────────
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    for (const hit of (e.intersections ?? [])) {
      const key = resolveKey(hit.object)
      if (key && !TRANSPARENT_SHELLS.has(key) && MESH_TO_ORGAN_ID[key]) {
        onSelect(MESH_TO_ORGAN_ID[key])
        return
      }
    }
  }, [onSelect])

  // ── Hover cursor ───────────────────────────────────────────────────────────
  const handlePointerOver = useCallback((e) => {
    const found = (e.intersections ?? []).some((hit) => {
      const key = resolveKey(hit.object)
      return key && !TRANSPARENT_SHELLS.has(key) && MESH_TO_ORGAN_ID[key]
    })
    document.body.style.cursor = found ? "pointer" : "default"
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "default"
  }, [])

  return (
    <group ref={groupRef}>
      <group ref={offsetRef}>
        <primitive
          object={scene}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      </group>
    </group>
  )
}

// ─── Scene wrapper ─────────────────────────────────────────────────────────────
export default function DigestiveSimulation({ system }) {
  const { currentOrgan, setCurrentOrgan } = useAppStore()
  const [isSpinning, setIsSpinning]       = useState(true)
  const spinTimerRef                      = useRef(null)
  const [zoomCommand, setZoomCommand]     = useState(null)

  const pauseSpin = useCallback(() => {
    setIsSpinning(false)
    clearTimeout(spinTimerRef.current)
  }, [])

  const resumeSpinSoon = useCallback(() => {
    clearTimeout(spinTimerRef.current)
    spinTimerRef.current = setTimeout(() => setIsSpinning(true), 1500)
  }, [])

  const handleOrbitStart = useCallback(() => pauseSpin(),      [pauseSpin])
  const handleOrbitEnd   = useCallback(() => resumeSpinSoon(), [resumeSpinSoon])

  const triggerZoom = useCallback((direction) => {
    pauseSpin()
    setZoomCommand({ direction, id: performance.now() })
    resumeSpinSoon()
  }, [pauseSpin, resumeSpinSoon])

  useEffect(() => () => clearTimeout(spinTimerRef.current), [])

  const selectedOrganId = currentOrgan?.id ?? null

  const handleSelect = useCallback((organId) => {
    if (!organId || !system) return
    const organ = system.organs.find((o) => o.id === organId)
    if (organ) {
      setCurrentOrgan(organ)
      speakOrgan(organ)
    }
  }, [system, setCurrentOrgan])

  return (
    <div className="relative w-full h-full" style={{ minHeight: 570 }}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {["+", "−"].map((label, i) => (
          <button
            key={label}
            onClick={() => triggerZoom(i === 0 ? "in" : "out")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold transition-all duration-150 select-none"
            style={{
              background:     "rgba(59,130,246,0.18)",
              border:         "1.5px solid rgba(59,130,246,0.30)",
              color:          "#2563eb",
              backdropFilter: "blur(8px)",
            }}
            aria-label={i === 0 ? "Zoom in" : "Zoom out"}
          >
            {label}
          </button>
        ))}
      </div>

      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[0, 3, 4]}  intensity={1.6} color="#ffffff" />
        <directionalLight position={[-3, 5, 2]} intensity={0.8} color="#fff4e0" />
        <directionalLight position={[3, 1, -4]} intensity={0.4} color="#ddeeff" />
        <pointLight       position={[0, -2, 3]} intensity={0.6} color="#ffffff" />
        <Environment preset="city" environmentIntensity={0.6} />
        <SmoothCameraZoom
          command={zoomCommand}
          minDistance={0.32}
          maxDistance={8}
          zoomFactor={0.62}
        />
        <DigestiveModel
          onSelect={handleSelect}
          selectedOrganId={selectedOrganId}
          isSpinning={isSpinning}
        />
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={0.32}
          maxDistance={8}
          target={[0, 0, 0]}
          onStart={handleOrbitStart}
          onEnd={handleOrbitEnd}
        />
      </Canvas>
    </div>
  )
}