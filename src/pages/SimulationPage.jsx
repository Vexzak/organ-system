import { useEffect, lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OrganList from '../components/OrganList'
import { getSystemById } from '../data/organSystems'
import useAppStore from '../store/useAppStore'
import { useGLTF } from "@react-three/drei"

// Lazy-load simulations
const simulations = {
  digestive:   lazy(() => import('../simulations/DigestiveSimulation')),
  circulatory: lazy(() => import('../simulations/CirculatorySimulation')),
  skeletal:    lazy(() => import('../simulations/SkeletalSimulation')),
  muscular:    lazy(() => import('../simulations/MuscularSimulation')),
  respiratory: lazy(() => import('../simulations/RespiratorySimulation')),
}

function CanvasLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-blue-400/60 text-sm font-medium">Loading simulation…</span>
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M8 5.5L19 12L8 18.5V5.5Z" fill="#94a3b8" />
      </svg>
    </div>
  )
}

function SystemSpeakerButton({ systemId, label }) {
  const mp3BySystemId = {
    digestive: '/digestive_system.mp3',
    circulatory: '/circulatory_system.mp3',
    skeletal: '/skeletal_system.mp3',
    muscular: '/muscular_system.mp3',
    respiratory: '/respiratory_system.mp3',
  }

  const src = mp3BySystemId[systemId]

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!src) return
        try {
          const audio = new Audio(src)
          audio.play().catch(() => {})
        } catch {}
      }}
      className="shrink-0 inline-flex items-center justify-center"
      style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        background: 'rgba(219,234,254,0.65)',
        border: '1px solid rgba(147,197,253,0.4)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
        color: '#3b82f6',
        cursor: 'pointer',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M11 5L6.5 9H3v6h3.5L11 19V5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M15.54 8.46a5 5 0 0 1 0 7.07"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18.36 5.64a9 9 0 0 1 0 12.72"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

export default function SimulationPage() {
  const { systemId } = useParams()
  const navigate = useNavigate()
  const { setCurrentSystem, setCurrentOrgan, currentOrgan } = useAppStore()

  const system = getSystemById(systemId)
  const SimComponent = simulations[systemId]

  useEffect(() => {
    if (!system) { navigate('/'); return }

    const glbMap = {
      muscular:    "/muscular_system.glb",
      skeletal:    "/skeletal_system.glb",
      circulatory: "/circulatory_system.glb",
      digestive:   "/digestive_system.glb",
      respiratory: "/respiratory_system.glb",
    }
    if (glbMap[systemId]) useGLTF.clear(glbMap[systemId])

    setCurrentOrgan(null)
    setCurrentSystem(system)

    const timer = setTimeout(() => {
      if (system.organs?.[2]) setCurrentOrgan(system.organs[2])
    }, 150)

    return () => clearTimeout(timer)
  }, [systemId])

  if (!system || !SimComponent) return null

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#eaf3fb' }}
    >
      {/* Background blobs */}
      <div className="fixed pointer-events-none" style={{
        top: '-60px', right: '-60px', width: '340px', height: '340px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,210,255,0.70) 0%, rgba(186,224,255,0.30) 50%, transparent 75%)',
        zIndex: 0,
      }} />
      <div className="fixed pointer-events-none" style={{
        top: '35%', right: '-30px', width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186,224,255,0.60) 0%, transparent 70%)',
        zIndex: 0,
      }} />
      <div className="fixed pointer-events-none" style={{
        bottom: '-80px', left: '-80px', width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,210,255,0.65) 0%, rgba(186,224,255,0.25) 50%, transparent 72%)',
        zIndex: 0,
      }} />
      <div className="fixed pointer-events-none" style={{
        bottom: '15%', left: '30%', width: '100px', height: '100px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186,224,255,0.45) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
        <Navbar title={system.name} showBack onBack={() => navigate(`/system/${system.id}`)} />

        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* LEFT: Canvas panel */}
          <div
            className="flex-1 min-h-0 relative flex flex-col overflow-hidden"
            style={{
              minWidth: 0,
              background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #c8e8f8 0%, #daeef8 40%, #eaf4fb 100%)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div style={{
                position: 'absolute', top: '8%', left: '12%',
                width: 220, height: 220, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(200,232,248,0.25) 60%, transparent 80%)',
                filter: 'blur(2px)',
              }} />
              <div style={{
                position: 'absolute', top: '55%', left: '5%',
                width: 160, height: 160, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(180,220,245,0.20) 60%, transparent 80%)',
                filter: 'blur(1px)',
              }} />
              <div style={{
                position: 'absolute', top: '20%', right: '8%',
                width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.40) 0%, rgba(190,228,248,0.18) 60%, transparent 80%)',
                filter: 'blur(1px)',
              }} />
              <div style={{
                position: 'absolute', bottom: '10%', right: '15%',
                width: 100, height: 100, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 75%)',
              }} />
              <div style={{
                position: 'absolute', top: '40%', left: '40%',
                width: 80, height: 80, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.30) 0%, transparent 70%)',
              }} />
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative z-10">
              <Suspense fallback={<CanvasLoader />}>
                <SimComponent
                  key={systemId}
                  system={system}
                  selectedOrgan={currentOrgan}
                  canvasKey={systemId}
                />
              </Suspense>
            </div>
          </div>

          {/* RIGHT: Info panel */}
          <div
            className="flex flex-col min-h-0 overflow-hidden"
            style={{
              width: '50%',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              borderLeft: '1px solid rgba(186,224,255,0.5)',
            }}
          >
            {/* System badge */}
            <div className="px-6 pt-5 pb-0 shrink-0">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{
                  background: 'rgba(219,234,254,0.8)',
                  color: '#3b82f6',
                  border: '1px solid rgba(147,197,253,0.5)',
                }}
              >
                <span style={{ fontSize: 14 }}>{system.icon}</span>
                <span className="flex items-center gap-2">
                  {system.name}
                  <SystemSpeakerButton
                    systemId={system.id}
                    label={`Play ${system.name} audio`}
                  />
                </span>
              </div>
            </div>

            {/* Active organ card */}
            {currentOrgan ? (
              <div className="px-6 pt-4 pb-5 shrink-0">
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 20,
                    border: '1px solid rgba(200,220,240,0.6)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    padding: '20px',
                  }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: '#3b82f6', letterSpacing: '0.12em' }}
                  >
                    Active Organ
                  </div>

                  <div className="flex gap-5 items-stretch">
                    <div
                      style={{
                        width: '55%',
                        minHeight: 260,
                        borderRadius: 14,
                        flexShrink: 0,
                        background: 'linear-gradient(160deg, #c8d8e4 0%, #b8ccda 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        border: '1px solid rgba(170,200,220,0.4)',
                      }}
                    >
                      <PlayIcon />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: '#7a9ab0',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                        }}
                      >
                        
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h2
                        className="font-black leading-tight mb-3 animate-fade-in"
                        key={currentOrgan.id + '-title'}
                        style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.75rem)', color: '#1a2e4a' }}
                      >
                        {currentOrgan.name}
                      </h2>
                      <p
                        className="leading-relaxed animate-fade-in"
                        key={currentOrgan.id + '-desc'}
                        style={{ fontSize: 13.5, color: '#5a7a96', lineHeight: 1.65 }}
                      >
                        {currentOrgan.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 pt-4 pb-5 shrink-0">
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 20,
                    border: '1px solid rgba(200,220,240,0.6)',
                    padding: '20px',
                    color: '#94a3b8',
                    fontSize: 14,
                  }}
                >
                  Select an organ to learn more
                </div>
              </div>
            )}

            {/* Organs list (scroll only here) */}
            <div className="flex-1 min-h-0 px-6 pb-6 flex flex-col">
              <div
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: '#94a3b8', letterSpacing: '0.12em' }}
              >
                Organs
              </div>
              <div
                className="flex-1 min-h-0 overflow-y-auto pr-1"
              >
                <OrganList
                  organs={system.organs}
                  accentColor={system.accentColor}
                  glowColor={system.glowColor}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
