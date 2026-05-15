import { useState } from 'react'
import SystemInput from './components/SystemInput.jsx'
import FmeaTable from './components/FmeaTable.jsx'
import QuadrantChart from './components/QuadrantChart.jsx'
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

      {/* Header — left-aligned, full width */}
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-5">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Engineering Program Manager Tools Portfolio
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            Failure Mode and Effects Analysis Assistant
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Describe a hardware system in plain language and receive a structured
            failure-mode analysis you can edit, score, and export. Designed to
            compress the experience gap that makes early-career hardware program
            managers miss obvious failure modes.
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 py-6 gap-6">

        {/* Input form — left-aligned */}
        <SystemInput onSubmit={handleGenerate} loading={loading} />

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <strong className="font-semibold">Could not generate analysis.</strong>{' '}
            {error}
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Describe a system above and click Generate to see a draft analysis here.
          </div>
        )}

        {rows.length > 0 && (
          <section className="flex-1 flex flex-col gap-3 min-h-0">

            {/* Table title + export — left-aligned */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Generated Failure Mode and Effects Analysis
                </h2>
                <p className="text-sm text-slate-600">
                  Showing top 10 of {rows.length} rows by Risk Priority Number. Edit any cell — scores and the priority matrix update automatically.
                </p>
              </div>
              <ExportButton rows={rows} systemDescription={systemDescription} />
            </div>

            {/* Side-by-side: table left (flex-1), chart right (fixed width) — both stretch to same height */}
            <div className="flex gap-6 flex-1 min-h-0">
              <div className="flex-1 min-w-0 flex flex-col min-h-0">
                <FmeaTable rows={rows} onChange={handleRowsChange} />
              </div>
              <div className="w-[520px] flex-shrink-0">
                <QuadrantChart rows={rows} />
              </div>
            </div>

          </section>
        )}
      </main>

      <PortfolioFooter />
    </div>
  )
}
