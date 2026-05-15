import { useState } from 'react'

const exampleDescription = `A consumer-grade DSLR camera body with a 24-megapixel APS-C CMOS sensor, optical pentaprism viewfinder, 45-point phase-detection autofocus system, mechanical focal-plane shutter rated to 150,000 actuations, 5-axis in-body image stabilization, and a native bayonet lens mount supporting interchangeable lenses. Designed for enthusiast photographers. Operating temperature 0 to 40 degrees Celsius. Annual production volume approximately 500,000 units.`

const exampleFunctions = `- Capture sharp, correctly exposed images across a range of lighting conditions
- Focus accurately on stationary and moving subjects using phase-detection autofocus
- Provide an accurate through-the-lens optical viewfinder image
- Write image data reliably to dual SD card slots
- Power the system for at least 800 shots per battery charge`

export default function SystemInput({ onSubmit, loading }) {
  const [description, setDescription] = useState('')
  const [functions, setFunctions] = useState('')

  const loadExample = () => {
    setDescription(exampleDescription)
    setFunctions(exampleFunctions)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!description.trim()) return
    onSubmit(description.trim(), functions.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="system-description" className="text-sm font-medium text-slate-700">
            System or subsystem description
          </label>
          <button
            type="button"
            onClick={loadExample}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Load DSLR camera example
          </button>
        </div>
        <textarea
          id="system-description"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the system in plain language. Include the technology, the operating environment, the user-facing function, and the volume class (prototype, low volume, high volume)."
          className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400"
        />
      </div>

      <div>
        <label htmlFor="system-functions" className="text-sm font-medium text-slate-700">
          Key functions (optional, one per line)
        </label>
        <textarea
          id="system-functions"
          rows={4}
          value={functions}
          onChange={(event) => setFunctions(event.target.value)}
          placeholder="One function per line. Helps the analysis stay anchored to what the system is supposed to do."
          className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400 font-mono"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !description.trim()}
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
        <span className="text-xs text-slate-500">
          Typical generation takes 10 to 25 seconds.
        </span>
      </div>
    </form>
  )
}
