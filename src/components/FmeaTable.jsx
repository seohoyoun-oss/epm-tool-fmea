// Editable Failure Mode and Effects Analysis table.
// Severity, Occurrence, and Detection are integers from 1 to 10.
// Risk Priority Number = Severity * Occurrence * Detection. Recomputed on every edit.

const ratingTooltip = {
  severity:
    'Severity (1-10): how serious is the effect on the user or downstream system if this failure happens? 1 = no effect, 10 = catastrophic.',
  occurrence:
    'Occurrence (1-10): how likely is this failure to happen in production? 1 = effectively impossible, 10 = nearly certain.',
  detection:
    'Detection (1-10): how likely is your current testing to catch this before it ships? 1 = certain to catch, 10 = no chance of catching.',
}

function clampRating(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return 1
  return Math.max(1, Math.min(10, Math.round(n)))
}

function rpnColor(rpn) {
  if (rpn >= 200) return 'bg-red-100 text-red-900'
  if (rpn >= 100) return 'bg-amber-100 text-amber-900'
  if (rpn >= 40) return 'bg-yellow-50 text-yellow-900'
  return 'bg-green-50 text-green-900'
}

export default function FmeaTable({ rows, onChange }) {
  const updateRow = (id, field, value) => {
    const next = rows.map((row) => {
      if (row.id !== id) return row
      const updated = { ...row, [field]: value }
      if (['severity', 'occurrence', 'detection'].includes(field)) {
        updated[field] = clampRating(value)
        updated.rpn = updated.severity * updated.occurrence * updated.detection
      }
      return updated
    })
    onChange(next)
  }

  const removeRow = (id) => {
    onChange(rows.filter((row) => row.id !== id))
  }

  const sortedRows = [...rows]
    .sort((a, b) => (b.rpn || 0) - (a.rpn || 0))
    .slice(0, 10)
    .map((row, i) => ({ ...row, rank: i + 1 }))

  return (
    <div className="flex-1 flex flex-col min-h-0 rounded border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-auto flex-1">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 sticky top-0 z-10">
          <tr>
            <Th width="3%">#</Th>
            <Th width="13%">Failure Mode</Th>
            <Th width="11%">Effect</Th>
            <Th width="10%">Cause</Th>
            <Th width="9%" tooltip="Teams responsible for resolving this failure mode. ME = Mechanical Eng, EE = Electrical Eng, OE = Optical Eng, SW = Software, FW = Firmware, SYS = Systems Eng, MFG = Manufacturing, QA = Quality Assurance, TE = Test Eng">Teams</Th>
            <Th width="5%" tooltip={ratingTooltip.severity}>S</Th>
            <Th width="5%" tooltip={ratingTooltip.occurrence}>O</Th>
            <Th width="5%" tooltip={ratingTooltip.detection}>D</Th>
            <Th width="5%">RPN</Th>
            <Th width="13%">Recommended Action</Th>
            <Th width="3%" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedRows.map((row) => (
            <tr key={row.id} className="align-top hover:bg-slate-50">
              <td className="px-3 py-2 text-center font-semibold text-slate-500 text-sm">{row.rank}</td>
              <EditableCell value={row.customerImpact} onChange={(value) => updateRow(row.id, 'customerImpact', value)} accent />
              <EditableCell value={row.effect} onChange={(value) => updateRow(row.id, 'effect', value)} />
              <EditableCell value={row.cause} onChange={(value) => updateRow(row.id, 'cause', value)} />
              <EditableCell value={row.teams} onChange={(value) => updateRow(row.id, 'teams', value)} placeholder="ME, EE, SW…" />
              <RatingCell value={row.severity} onChange={(value) => updateRow(row.id, 'severity', value)} />
              <RatingCell value={row.occurrence} onChange={(value) => updateRow(row.id, 'occurrence', value)} />
              <RatingCell value={row.detection} onChange={(value) => updateRow(row.id, 'detection', value)} />
              <td className={`px-3 py-2 text-center font-mono font-semibold ${rpnColor(row.rpn || 0)}`}>
                {row.rpn || 0}
              </td>
              <EditableCell value={row.recommendedAction} onChange={(value) => updateRow(row.id, 'recommendedAction', value)} />
              <td className="px-2 py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="text-slate-400 hover:text-red-600 text-xs"
                  aria-label="Remove this row"
                  title="Remove row"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function Th({ children, width, tooltip }) {
  return (
    <th
      scope="col"
      style={{ width }}
      title={tooltip}
      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
    >
      {children}
    </th>
  )
}

function EditableCell({ value, onChange, accent = false, placeholder }) {
  return (
    <td className={`px-3 py-2 ${accent ? 'bg-blue-50' : ''}`}>
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        placeholder={placeholder}
        className={`w-full bg-transparent text-sm leading-snug resize-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 ${
          accent ? 'text-blue-900 font-medium' : 'text-slate-900'
        }`}
      />
    </td>
  )
}

function RatingCell({ value, onChange }) {
  return (
    <td className="px-2 py-2 text-center">
      <input
        type="number"
        min={1}
        max={10}
        value={value || 1}
        onChange={(event) => onChange(event.target.value)}
        className="w-12 text-center bg-transparent rounded font-mono focus:bg-white focus:ring-1 focus:ring-blue-400"
      />
    </td>
  )
}
