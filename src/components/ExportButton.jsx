import Papa from 'papaparse'
import html2canvas from 'html2canvas'
import { useState } from 'react'

export default function ExportButton({ rows, systemDescription, chartRef }) {
  const [exportingPng, setExportingPng] = useState(false)

  const handleExportCsv = () => {
    const exportRows = rows.map(({ id, ...rest }) => ({
      'Customer Impact': rest.customerImpact || '',
      Function: rest.function || '',
      'Failure Mode': rest.failureMode || '',
      Effect: rest.effect || '',
      Cause: rest.cause || '',
      Severity: rest.severity || 0,
      Occurrence: rest.occurrence || 0,
      Detection: rest.detection || 0,
      'Risk Priority Number': rest.rpn || 0,
      Teams: rest.teams || '',
      'Recommended Action': rest.recommendedAction || '',
    }))

    const headerComment = [
      `# Failure Mode and Effects Analysis`,
      `# Generated: ${new Date().toISOString()}`,
      `# System: ${(systemDescription || '').slice(0, 200)}`,
      '',
    ].join('\n')

    const csv = headerComment + Papa.unparse(exportRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fmea-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPng = async () => {
    if (!chartRef?.current) return
    setExportingPng(true)
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `fmea-priority-matrix-${new Date().toISOString().slice(0, 10)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setExportingPng(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExportCsv}
        className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Export to CSV
      </button>
      <button
        type="button"
        onClick={handleExportPng}
        disabled={exportingPng}
        className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exportingPng ? 'Saving…' : 'Export to PNG'}
      </button>
    </div>
  )
}
