import Papa from 'papaparse'

export default function ExportButton({ rows, systemDescription }) {
  const handleExport = () => {
    const exportRows = rows.map(({ id, ...rest }) => ({
      Function: rest.function || '',
      'Failure Mode': rest.failureMode || '',
      Effect: rest.effect || '',
      Cause: rest.cause || '',
      Severity: rest.severity || 0,
      Occurrence: rest.occurrence || 0,
      Detection: rest.detection || 0,
      'Risk Priority Number': rest.rpn || 0,
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

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Export to CSV
    </button>
  )
}
