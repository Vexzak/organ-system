import useAppStore from '../store/useAppStore'

function organIconSVG(id, color) {
  const stroke = color || '#3b82f6'
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path {...common} d="M7 9v6h4l5 4V5l-5 4H7Z" />
      <path {...common} d="M16.5 8.5c1.5 1.5 1.5 4 0 5.5" />
      <path {...common} d="M18.5 6.5c3 3 3 7.5 0 10.5" />
    </svg>
  )
}

export default function OrganList({ organs }) {
  const currentOrgan    = useAppStore((s) => s.currentOrgan)
  const setCurrentOrgan = useAppStore((s) => s.setCurrentOrgan)

  return (
    <div
      className="grid grid-cols-2 gap-3 pr-1"
    >
      {organs.map((organ, i) => {
        const isActive = currentOrgan?.id === organ.id
        return (
          <button
            key={organ.id}
            onClick={() => setCurrentOrgan(organ)}
            className="text-left rounded-2xl transition-all duration-150 flex items-center gap-3 animate-slide-right"
            style={{
              animationDelay: `${i * 40}ms`,
              padding: '12px 14px',
              minHeight: '64px',
              border: isActive ? '2px solid #3b82f6' : '1.5px solid rgba(200,220,240,0.7)',
              outline: 'none',
              cursor: 'pointer',
              background: isActive
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : '#ffffff',
              boxShadow: isActive
                ? '0 4px 16px rgba(59,130,246,0.30)'
                : '0 1px 6px rgba(0,0,0,0.05)',
              color: isActive ? '#ffffff' : '#4b7aa8',
            }}
            aria-pressed={isActive}
          >
            {/* Icon box */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? 'rgba(255,255,255,0.20)'
                  : 'rgba(219,234,254,0.6)',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(147,197,253,0.4)'}`,
              }}
              aria-hidden="true"
            >
              {organIconSVG(organ.id, isActive ? '#ffffff' : '#3b82f6')}
            </div>

            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: isActive ? '#ffffff' : '#334e6b',
              }}
            >
              {organ.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}