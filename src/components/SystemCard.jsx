import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const systemImages = {
  digestive:   '/digestive_system.png',
  circulatory: '/circulatory_system.png',
  skeletal:    '/skeletal_system.png',
  muscular:    '/muscular_system.png',
  respiratory: '/respiratory_system.png',
}

export default function SystemCard({ system, index }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(`/system/${system.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer flex flex-col items-center text-center"
      style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '24px 16px 20px',
        border: '1px solid rgba(200,220,240,0.6)',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Circular image */}
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'rgba(219,234,254,0.45)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={systemImages[system.id]}
          alt={system.name}
          style={{
            width: '70px',
            height: '70px',
            objectFit: 'contain',
            display: 'block',
            transform: hovered ? 'scale(1.2) rotate(8deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* System name */}
      <h3 className="font-bold mb-1" style={{ fontSize: '15px', color: '#1a2e4a', lineHeight: 1.3 }}>
        {system.name}
      </h3>

      {/* Tagline */}
      <p className="mb-3" style={{ fontSize: '12px', color: '#7a95b0', lineHeight: 1.5 }}>
        {system.tagline}
      </p>

      {/* Organ count pill */}
      {system.organs?.length && (
        <div
          className="inline-flex items-center px-3 py-1 rounded-full mb-3 font-medium"
          style={{
            fontSize: '12px',
            background: 'rgba(219,234,254,0.6)',
            color: '#2563eb',
            border: '1px solid rgba(147,197,253,0.4)',
          }}
        >
          {system.organs.length} organs
        </div>
      )}

      {/* Explore link */}
      <button
        className="font-medium mt-auto"
        style={{
          fontSize: '13px',
          color: hovered ? '#1d4ed8' : '#3b82f6',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.15s ease',
        }}
      >
        Explore →
      </button>
    </div>
  )
}