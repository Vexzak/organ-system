import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { organSystems } from '../data/organSystems'
import { useState, useRef, useEffect } from 'react'

function SystemDropdown({ systemId }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = organSystems.find(s => s.id === systemId)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        style={{
          background: open ? 'rgba(239,246,255,0.95)' : 'rgba(255,255,255,0.95)',
          border: open ? '1px solid rgba(96,165,250,0.55)' : '1px solid rgba(186,224,255,0.7)',
          color: '#2b6cb0',
          boxShadow: open
            ? '0 0 0 3px rgba(147,210,255,0.2), 0 4px 16px rgba(96,165,250,0.15)'
            : '0 2px 12px rgba(147,210,255,0.18)',
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{
          background: '#3b82f6',
          boxShadow: '0 0 6px rgba(59,130,246,0.55)'
        }} />
        <span className="whitespace-nowrap min-w-[120px] text-left">
          {current ? current.name : 'Select System'}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12" fill="none"
          style={{ color: '#60a5fa' }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+8px)] right-0 z-50 min-w-[210px] rounded-xl overflow-hidden p-1.5"
          style={{
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid rgba(186,224,255,0.6)',
            boxShadow: '0 8px 32px rgba(96,165,250,0.15), 0 2px 8px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase px-2.5 pt-1.5 pb-1" style={{ color: '#93c5fd' }}>
            Select System
          </p>
          {organSystems.map(s => (
            <button
              key={s.id}
              role="option"
              aria-selected={s.id === systemId}
              onClick={() => { navigate(`/system/${s.id}`); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left"
              style={{
                background: s.id === systemId ? 'rgba(239,246,255,0.8)' : 'transparent',
                color: s.id === systemId ? '#1e40af' : '#4b7aa8',
              }}
              onMouseEnter={e => { if (s.id !== systemId) e.currentTarget.style.background = 'rgba(239,246,255,0.5)' }}
              onMouseLeave={e => { if (s.id !== systemId) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-base opacity-90">{s.emoji}</span>
              <span className="flex-1">{s.name}</span>
              {s.organCount && (
                <span className="text-[11px] font-normal" style={{ color: '#93c5fd' }}>{s.organCount} organs</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar({ showBack = false, onBack }) {
  const { systemId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // HashRouter: pathname can stay at '/', so use hash for the real route.
  const hash = location.hash?.replace(/^#/, '') || ''
  const effectivePath = hash.startsWith('/') ? hash : location.pathname

  const isHome = effectivePath === '/'

  const handleBack = () => {
    // Prefer an explicit back handler passed from the page.
    if (onBack) return onBack()

    // Deterministic navigation for this app.
    // From /simulation/:systemId -> /system/:systemId
    if (effectivePath.startsWith('/simulation/')) {
      const sid = systemId
      if (sid) navigate(`/system/${sid}`)
      return
    }

    // Fallback: browser history.
    navigate(-1)
  }


  return (
    <nav
      className="flex items-center justify-center h-16 px-6 sticky top-0 z-50 relative whitespace-nowrap flex-nowrap"
      style={{
        background: 'rgba(255,255,255,0.88)',
        borderBottom: '1px solid rgba(186,224,255,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {!isHome && (
        <div className="absolute left-6 flex items-center gap-3 flex-nowrap">
          {showBack && (
            <button
              onClick={handleBack}

              className="flex items-center gap-2 transition-colors duration-200 group"
              style={{ color: '#3b82f6' }}
            >
              <span className="text-lg group-hover:-translate-x-1 transition-transform duration-200">←</span>
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium ml-1 hidden sm:inline transition-colors duration-200"
            style={{ color: '#93c5fd' }}
            onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
            onMouseLeave={e => e.currentTarget.style.color = '#93c5fd'}
          >
            Home
          </button>
        </div>
      )}

      {/* Centered logo + title */}
      <div className="flex items-center gap-2 flex-nowrap min-w-0">
        {/* Hexagon with filled vector heart, heart shifted down to true center */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagon outline — larger, centered on 17,17 */}
          <path
            d="M17 2L31 9.5V24.5L17 32L3 24.5V9.5L17 2Z"
            stroke="#3b82f6"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Heart — same size, centered at 17,17 */}
          <path
            d="M17 23C17 23 11 19 11 15.5C11 13.6 12.6 12 14.5 12C15.6 12 16.6 12.6 17 13.5C17.4 12.6 18.4 12 19.5 12C21.4 12 23 13.6 23 15.5C23 19 17 23 17 23Z"
            fill="#3b82f6"
            stroke="#3b82f6"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-bold tracking-wide whitespace-nowrap" style={{ color: '#1e3a5f', fontSize: '1rem' }}>
          Organ Systems
        </span>
      </div>

      {/* Right — dropdown */}
      <div className="absolute right-6 flex items-center flex-nowrap min-w-0">
        <SystemDropdown systemId={systemId} />
      </div>
    </nav>
  )
}