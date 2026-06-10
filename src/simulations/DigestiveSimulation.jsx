import { useCallback, useState } from "react"

export default function DigestiveSimulation() {
  const [zoom, setZoom] = useState(1)

  const triggerZoom = useCallback((direction) => {
    setZoom((current) => {
      const next = direction === "in" ? current * 1.35 : current / 1.35
      return Math.min(5, Math.max(1, next))
    })
  }, [])

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: 570 }}
    >
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
        >-</button>
      </div>

      <img
        src="/digestive_system.png"
        alt="Digestive system"
        className="max-w-[72%] max-h-[86%] object-contain select-none"
        draggable="false"
        style={{
          transform: `scale(${zoom})`,
          transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
          filter: 'drop-shadow(0 16px 34px rgba(30,64,120,0.16))',
        }}
      />
    </div>
  )
}
