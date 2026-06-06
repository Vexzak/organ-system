import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import SystemCard from '../components/SystemCard'
import { organSystems } from '../data/organSystems'
import useAppStore from '../store/useAppStore'

export default function HomePage() {
  const reset = useAppStore((s) => s.reset)

  useEffect(() => { reset() }, [reset])

  return (
    <div className="min-h-screen flex flex-col mesh-bg">

      {/* Large orb top-right */}
      <div className="fixed pointer-events-none" style={{
        top: '-60px', right: '-60px',
        width: '340px', height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,210,255,0.70) 0%, rgba(186,224,255,0.30) 50%, transparent 75%)',
        zIndex: 0,
      }} />

      {/* Medium orb mid-right */}
      <div className="fixed pointer-events-none" style={{
        top: '35%', right: '-30px',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186,224,255,0.60) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      {/* Large orb bottom-left */}
      <div className="fixed pointer-events-none" style={{
        bottom: '-80px', left: '-80px',
        width: '380px', height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,210,255,0.65) 0%, rgba(186,224,255,0.25) 50%, transparent 72%)',
        zIndex: 0,
      }} />

      {/* Small orb bottom-center */}
      <div className="fixed pointer-events-none" style={{
        bottom: '15%', left: '30%',
        width: '100px', height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186,224,255,0.45) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        {/* Hero */}
        <div className="flex flex-col items-center justify-center pt-12 pb-8 px-6 text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(180,210,235,0.55)',
              color: '#3a82b8',
              boxShadow: '0 2px 14px rgba(96,165,220,0.10)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
            Interactive Education
          </div>

          {/* Title — padding added so gradient clip doesn't cut descenders */}
          <h1
            className="font-black tracking-tight mb-4"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
              lineHeight: '1.1',
              paddingBottom: '0.1em',
              background: 'linear-gradient(90deg, #1a2e4a 0%, #00a6ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
          >
            Organ Systems
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
            style={{ color: '#6b8fa8' }}
          >
            Explore the five major human organ systems<br className="hidden sm:block" />
            through interactive simulations
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 px-8 pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
            {organSystems.map((system, index) => (
              <SystemCard key={system.id} system={system} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}