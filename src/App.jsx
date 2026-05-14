import { useState } from 'react'
import SystemInput from './components/SystemInput.jsx'
import FmeaTable from './components/FmeaTable.jsx'
import ExportButton from './components/ExportButton.jsx'
import PortfolioFooter from './components/PortfolioFooter.jsx'
import { generateFmea } from './lib/apiClient.js'

export default function App() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [systemDescription, setSystemDescription] = useState('')

  const handleGenerate = async (description, functions) => {
    setLoading(true)
    setError(null)
    setSystemDescription(description)
    try {
      const generated = await generateFmea({ description, functions })
      // Each row gets a stable identifier so React can track it across edits.
      const stamped = generated.map((row, index) => ({
        id: `row-${Date.now()}-${index}`,
        ...row,
      }))
      setRows(stamped)
    } catch (err) {
      setError(err.message || 'Something went wrong generating the analysis.')
    } finally {
      setLoading(false)
    }
  }

  const handleRowsChange = (next) => setRows(next)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Engineering Program Manager Tools Portfolio
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            Failure Mode and Effects Analysis Assistant
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl">
            Describe a hardware system in plain language and receive a structured
            failure-mode analysis you can edit, score, and export. Designed to
            compress the experience gap that makes early-career hardware program
            managers miss obvious failure modes.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        <SystemInput onSubmit={handleGenerate} loading={loading} />

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <strong className="font-semibold">Could not generate analysis.</strong>{' '}
            {error}
          </div>
        )}

        {rows.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Generated Failure Mode and Effects Analysis
                </h2>
                <p className="text-sm text-slate-600">
                  {rows.length} proposed rows. Edit any cell. Severity, occurrence, and
                  detection update Risk Priority Number automatically.
                </p>
              </div>
              <ExportButton rows={rows} systemDescription={systemDescription} />
            </div>
            <FmeaTable rows={rows} onChange={handleRowsChange} />
          </section>
        )}

        {rows.length === 0 && !loading && (
          <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Describe a system above and click Generate to see a draft analysis here.
          </div>
        )}
      </main>

      <PortfolioFooter />
    </div>
  )
}
