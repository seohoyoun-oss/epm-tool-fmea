import { useState } from 'react'

function StepBadge({ number }) {
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center h-6 px-2 rounded-full bg-blue-600 text-white text-xs font-bold whitespace-nowrap">
      Step {number}
    </span>
  )
}

const designChangePlaceholder = `Describe the design change(s) being evaluated. One change per line.

Examples:
- Replace brushed DC motor with BLDC motor for main brush roll
- Switch cliff sensors from single IR to multi-zone time-of-flight array
- Increase battery capacity from 2600 mAh to 3800 mAh Li-ion cells
- Add LiDAR module for room-mapping and navigation`

export default function SystemInput({ onSubmit, loading }) {
  const [designChange, setDesignChange] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!designChange.trim()) return
    onSubmit(designChange.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Step 1 */}
      <div className="flex items-start gap-3">
        <StepBadge number="1" />
        <div>
          <p className="text-sm font-semibold text-slate-700 leading-6">Review the Engineering Requirements Specification (Robot Vacuum Preloaded as an Example)</p>
          <button
            type="button"
            onClick={() => window.open('/ERS_Robot_Vacuum.pdf', '_blank')}
            className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            ERS Preview
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-3">
        <StepBadge number="2" />
        <div className="flex-1">
          <label htmlFor="design-change" className="block text-sm font-semibold text-slate-700 leading-6">
            Enter Design Change(s)
          </label>
          <textarea
            id="design-change"
            rows={6}
            value={designChange}
            onChange={(event) => setDesignChange(event.target.value)}
            placeholder={designChangePlaceholder}
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400 font-mono"
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex items-center gap-3">
        <StepBadge number="3" />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !designChange.trim()}
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Generating analysis…
              </>
            ) : (
              'Generate Failure Mode and Effects Analysis'
            )}
          </button>
          <span className="text-xs text-slate-500">Typical generation takes 10 to 25 seconds.</span>
        </div>
      </div>

    </form>
  )
}
