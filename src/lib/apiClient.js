// Browser-side client. Posts the system description to the Vercel serverless
// function at /api/fmea, which proxies to the Anthropic Application Programming
// Interface server-side. The Anthropic key never touches the browser.

export async function generateFmea({ description, functions }) {
  const response = await fetch('/api/fmea', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, functions }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      errorText || `Server returned ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()
  if (!Array.isArray(data.rows)) {
    throw new Error('Unexpected response format from /api/fmea.')
  }
  return data.rows
}
