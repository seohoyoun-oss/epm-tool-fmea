import { useState, useMemo, forwardRef } from 'react'

const W   = 520
const H   = 500
const PAD = { top: 62, right: 24, bottom: 80, left: 72 }
const CW  = W - PAD.left - PAD.right
const CH  = H - PAD.top  - PAD.bottom

// P1 = high risk / low cost  → top-left
// P2 = low risk  / low cost  → bottom-left
// P3 = high risk / high cost → top-right
// P4 = low risk  / high cost → bottom-right
const QUADRANT_META = {
  p1: { label: 'P1', desc: 'High Risk · Low Cost',  color: '#15803d', bg: '#bbf7d0' },
  p2: { label: 'P2', desc: 'Low Risk · Low Cost',   color: '#1d4ed8', bg: '#dbeafe' },
  p3: { label: 'P3', desc: 'High Risk · High Cost', color: '#ca8a04', bg: '#fef08a' },
  p4: { label: 'P4', desc: 'Low Risk · High Cost',  color: '#9f1239', bg: '#fecdd3' },
}

// X divider is always fixed at the center of the 1–10 cost scale
const COST_MID = 5.5
const X_MID    = CW / 2   // pixel position of the vertical divider (never moves)

// Y scaling: map rpn to chart pixels with a small margin so dots
// never sit on the axis lines. The horizontal divider is always at
// CH/2, which corresponds to the midpoint of the visible RPN range.
const Y_MARGIN = 0.06

const QuadrantChart = forwardRef(function QuadrantChart({ rows }, ref) {
  const [hovered, setHovered] = useState(null)

  const normalised = useMemo(
    () => rows.map(r => ({ ...r, actionCost: r.actionCost ?? 5 })),
    [rows]
  )

  const top10 = useMemo(
    () => [...normalised].sort((a, b) => b.rpn - a.rpn).slice(0, 10),
    [normalised]
  )

  const rpnMin = useMemo(() => Math.min(...top10.map(r => r.rpn)), [top10])
  const rpnMax = useMemo(() => Math.max(...top10.map(r => r.rpn)), [top10])
  const rpnMid = (rpnMin + rpnMax) / 2   // value at the horizontal divider

  // X scale: cost 1→0, cost 10→CW. Midpoint (cost=5.5) → CW/2.
  const xs = cost => ((cost - 1) / 9) * CW

  // Y scale: linear, with Y_MARGIN padding top and bottom.
  // Ensures rpnMid always maps to CH/2 (divider never moves).
  const ys = rpn => {
    const range = rpnMax - rpnMin || 1
    return CH * (1 - Y_MARGIN) - ((rpn - rpnMin) / range) * CH * (1 - 2 * Y_MARGIN)
  }

  const Y_MID = CH / 2   // pixel position of the horizontal divider (never moves)

  // Classify by pixel position so dot color always matches the quadrant it sits in.
  function classify(cx, cy) {
    const hiRisk = cy < PAD.top + Y_MID
    const loCost = cx < PAD.left + X_MID
    if  (hiRisk &&  loCost) return 'p1'
    if  (!hiRisk && loCost) return 'p2'
    if  (hiRisk && !loCost) return 'p3'
    return 'p4'
  }

  const points = top10.map((r, i) => {
    const cx = PAD.left + xs(r.actionCost)
    const cy = PAD.top  + ys(r.rpn)
    return {
      ...r,
      cx,
      cy,
      q:    classify(cx, cy),
      rank: i + 1,
    }
  })

  function tooltipStyle(p) {
    const flipX = p.cx / W > 0.62
    return {
      position: 'absolute',
      left:  `${(p.cx / W) * 100}%`,
      top:   `${(p.cy / H) * 100}%`,
      transform: flipX
        ? 'translate(calc(-100% - 12px), -50%)'
        : 'translate(12px, -50%)',
      pointerEvents: 'none',
      zIndex: 10,
    }
  }

  // Label x-centres: fixed at ¼ and ¾ of chart width
  const lxLeft  = PAD.left + CW * 0.25
  const lxRight = PAD.left + CW * 0.75

  return (
    <section ref={ref} className="mt-2 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-1">
        Action Priority Matrix — Top 10 by RPN
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        <strong>Risk (Y):</strong> Risk Priority Number — scale adjusts to the dataset range.{' '}
        <strong>Cost (X):</strong> estimated implementation effort (1 = trivial, 10 = major investment).
        Division lines fixed at the centre of each axis. Hover a dot for details.
      </p>

      {/* Boxed chart container */}
      <div className="relative rounded border-2 border-slate-300 bg-white overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">

          {/* ── Quadrant backgrounds ─────────────────────────────── */}
          {/* top-left:     P1 high risk / low cost  */}
          <rect x={PAD.left}          y={PAD.top}          width={X_MID}       height={Y_MID}       fill={QUADRANT_META.p1.bg} opacity={0.6} />
          {/* top-right:    P3 high risk / high cost */}
          <rect x={PAD.left + X_MID}  y={PAD.top}          width={CW - X_MID}  height={Y_MID}       fill={QUADRANT_META.p3.bg} opacity={0.6} />
          {/* bottom-left:  P2 low risk  / low cost  */}
          <rect x={PAD.left}          y={PAD.top + Y_MID}  width={X_MID}       height={CH - Y_MID}  fill={QUADRANT_META.p2.bg} opacity={0.6} />
          {/* bottom-right: P4 low risk  / high cost */}
          <rect x={PAD.left + X_MID}  y={PAD.top + Y_MID}  width={CW - X_MID}  height={CH - Y_MID}  fill={QUADRANT_META.p4.bg} opacity={0.6} />

          {/* ── Chart border box ─────────────────────────────────── */}
          <rect x={PAD.left} y={PAD.top} width={CW} height={CH} fill="none" stroke="#64748b" strokeWidth={1.5} />

          {/* ── Fixed dividing lines ─────────────────────────────── */}
          <line
            x1={PAD.left + X_MID} y1={PAD.top}
            x2={PAD.left + X_MID} y2={PAD.top + CH}
            stroke="#64748b" strokeWidth={1.5} strokeDasharray="6 4"
          />
          <line
            x1={PAD.left} y1={PAD.top + Y_MID}
            x2={PAD.left + CW} y2={PAD.top + Y_MID}
            stroke="#64748b" strokeWidth={1.5} strokeDasharray="6 4"
          />

          {/* ── Quadrant labels — outside chart border ───────────── */}
          <text x={lxLeft}  y={PAD.top - 12} textAnchor="middle" fontSize={12} fontWeight={700} fill={QUADRANT_META.p1.color}>P1</text>
          <text x={lxRight} y={PAD.top - 12} textAnchor="middle" fontSize={12} fontWeight={700} fill={QUADRANT_META.p3.color}>P3</text>
          <text x={lxLeft}  y={PAD.top + CH + 20} textAnchor="middle" fontSize={12} fontWeight={700} fill={QUADRANT_META.p2.color}>P2</text>
          <text x={lxRight} y={PAD.top + CH + 20} textAnchor="middle" fontSize={12} fontWeight={700} fill={QUADRANT_META.p4.color}>P4</text>

          {/* ── Dots with rank numbers ───────────────────────────── */}
          {points.map((p, i) => (
            <g
              key={p.id ?? i}
              opacity={hovered && hovered !== p ? 0.3 : 1}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                cx={p.cx} cy={p.cy} r={13}
                fill={QUADRANT_META[p.q].color}
                style={{ transition: 'cx 0.4s ease, cy 0.4s ease, fill 0.4s ease' }}
              />
              <text
                x={p.cx} y={p.cy}
                textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={700} fill="white"
                style={{ transition: 'x 0.4s ease, y 0.4s ease', pointerEvents: 'none', userSelect: 'none' }}
              >
                {p.rank}
              </text>
            </g>
          ))}

          {/* ── X axis ───────────────────────────────────────────── */}
          <line x1={PAD.left} y1={PAD.top + CH} x2={PAD.left + CW} y2={PAD.top + CH} stroke="#475569" strokeWidth={1} />
          <text x={PAD.left}         y={PAD.top + CH + 38} textAnchor="middle" fontSize={10} fill="#64748b">Low (1)</text>
          <text x={PAD.left + X_MID} y={PAD.top + CH + 38} textAnchor="middle" fontSize={10} fill="#64748b">5.5</text>
          <text x={PAD.left + CW}    y={PAD.top + CH + 38} textAnchor="middle" fontSize={10} fill="#64748b">High (10)</text>
          <text x={PAD.left + CW/2}  y={PAD.top + CH + 58} textAnchor="middle" fontSize={12} fill="#334155">Implementation Cost →</text>

          {/* ── Y axis ───────────────────────────────────────────── */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CH} stroke="#475569" strokeWidth={1} />
          <text x={PAD.left - 8} y={PAD.top + CH * (1 - Y_MARGIN) + 4} textAnchor="end" fontSize={10} fill="#64748b">{rpnMin}</text>
          <text x={PAD.left - 8} y={PAD.top + CH * Y_MARGIN + 4}       textAnchor="end" fontSize={10} fill="#64748b">{rpnMax}</text>
          <text x={PAD.left - 8} y={PAD.top + Y_MID + 4}               textAnchor="end" fontSize={10} fill="#94a3b8">{Math.round(rpnMid)}</text>
          <text
            x={14} y={PAD.top + CH / 2}
            textAnchor="middle" fontSize={12} fill="#334155"
            transform={`rotate(-90, 14, ${PAD.top + CH / 2})`}
          >
            ↑ Risk Priority Number (RPN)
          </text>
        </svg>

        {/* ── Floating tooltip ─────────────────────────────────── */}
        {hovered && (
          <div style={tooltipStyle(hovered)} className="w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl text-xs">
            <div className="font-semibold text-slate-800 mb-0.5 leading-snug">{hovered.failureMode}</div>
            <div className="text-slate-500 mb-2">{hovered.function}</div>
            <div className="flex gap-3 mb-2">
              <span><strong>RPN:</strong> {hovered.rpn}</span>
              <span><strong>Cost:</strong> {hovered.actionCost}/10</span>
              <span style={{ color: QUADRANT_META[hovered.q].color }} className="font-semibold">
                {QUADRANT_META[hovered.q].label} — {QUADRANT_META[hovered.q].desc}
              </span>
            </div>
            <div className="text-slate-600 leading-snug"><strong>Action:</strong> {hovered.recommendedAction}</div>
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap gap-5 text-xs">
        {Object.entries(QUADRANT_META).map(([id, { label, desc, color }], i) => (
          <span key={id} className="flex items-center gap-2">
            <span
              className="inline-block w-5 h-5 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span>
              <strong style={{ color }}>{label}</strong>
              <span className="text-slate-400 ml-1">{desc}</span>
            </span>
          </span>
        ))}
      </div>
    </section>
  )
})

export default QuadrantChart
