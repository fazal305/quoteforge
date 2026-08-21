// Requests a rendered PDF from the backend and triggers a browser download.
// The function is stateless (see netlify/functions/render-quote-pdf.jsx) —
// we send it data we already have and already had permission to read,
// rather than having it re-fetch from Supabase itself.
export async function downloadQuotePdf({ quote, items, organization, customer }) {
  const res = await fetch('/api/render-quote-pdf', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ quote, items, organization, customer }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Could not generate the PDF. Please try again.')
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${quote.quote_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
