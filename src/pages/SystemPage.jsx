import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getSystemById } from '../data/organSystems'
import useAppStore from '../store/useAppStore'
import { speakSystem } from '../hooks/useOrganSpeech'

const systemImages = {
  digestive:   '/digestive_system.png',
  circulatory: '/circulatory_system.png',
  skeletal:    '/skeletal_system.png',
  muscular:    '/muscular_system.png',
  respiratory: '/respiratory_system.png',
}

export default function SystemPage() {
  const { systemId } = useParams()
  const navigate = useNavigate()
  const setCurrentSystem = useAppStore((s) => s.setCurrentSystem)
  const [hovered, setHovered] = useState(false)

  const system = getSystemById(systemId)

  useEffect(() => {
    if (system) setCurrentSystem(system)
    else navigate('/')
  }, [system, setCurrentSystem, navigate])

  if (!system) return null

  const goSimulation = () => navigate(`/simulation/${system.id}`)

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
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

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar title={system.name} showBack />

        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">

            {/* LEFT: Image card */}
            <div
              className="flex-1 flex items-center justify-center"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid rgba(200,220,240,0.5)',
                minHeight: '420px',
                overflow: 'hidden',
              }}
            >
              <img
                src={systemImages[system.id]}
                alt={system.name}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '360px',
                  objectFit: 'contain',
                  display: 'block',
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))',
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: hovered
                    ? 'scale(1.12) rotate(6deg)'
                    : 'scale(1) rotate(0deg)',
                }}
              />
            </div>

            {/* RIGHT: Info card */}
            <div
              className="flex-1 flex flex-col justify-center"
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid rgba(200,220,240,0.5)',
                minHeight: '420px',
              }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 uppercase tracking-widest self-start"
                style={{
                  background: 'rgba(219,234,254,0.7)',
                  color: '#3b82f6',
                  border: '1px solid rgba(147,197,253,0.4)',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
                Organ System
              </div>

              <div className="flex items-start gap-3 mb-2">
                <h1
                  className="font-black leading-tight"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1a2e4a' }}
                >
                  {system.name}
                </h1>

                {/* Speaker button — now uses Web Speech API (woman's voice) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    speakSystem(system)
                  }}
                  aria-label={`Play ${system.name} audio`}
                  className="shrink-0 inline-flex items-center justify-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: 'rgba(219,234,254,0.7)',
                    border: '1px solid rgba(147,197,253,0.45)',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    color: '#3b82f6',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
              </div>

              <p className="font-medium mb-4" style={{ fontSize: '16px', color: '#3b82f6' }}>
                {system.tagline}
              </p>

              <p className="leading-relaxed mb-6" style={{ fontSize: '14px', color: '#5a7a96' }}>
                {system.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {system.organs.map((organ) => (
                  <span
                    key={organ.id}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      color: '#4b7aa8',
                      border: '1px solid rgba(186,224,255,0.8)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {organ.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={goSimulation}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                    fontSize: '15px',
                  }}
                >
                  Open Simulation →
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-blue-50 active:scale-95"
                  style={{
                    background: '#ffffff',
                    color: '#3b82f6',
                    border: '1px solid rgba(147,197,253,0.6)',
                    fontSize: '15px',
                  }}
                >
                  ← Home
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}