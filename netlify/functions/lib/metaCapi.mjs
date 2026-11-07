function cookieValue(cookieHeader, name) {
  if (!cookieHeader) return undefined
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=')
    if (rawKey === name) {
      const value = rest.join('=').trim()
      return value || undefined
    }
  }
  return undefined
}

function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || undefined
  }
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('client-ip') ||
    undefined
  )
}

/**
 * Send a deduplicated Lead to Meta Conversions API.
 * Skips when tracking is declined or CAPI is not configured.
 * Does not send email or form answers.
 */
export async function sendMetaLead({
  request,
  eventId,
  trackingAllowed,
  eventSourceUrl,
}) {
  if (trackingAllowed === false) return { sent: false, reason: 'declined' }

  const pixelId = (process.env.META_PIXEL_ID ?? '').trim()
  const accessToken = (process.env.META_CAPI_ACCESS_TOKEN ?? '').trim()
  if (!pixelId || !accessToken) {
    return { sent: false, reason: 'not_configured' }
  }
  if (!eventId || typeof eventId !== 'string') {
    return { sent: false, reason: 'missing_event_id' }
  }

  const cookie = request.headers.get('cookie') ?? ''
  const userData = {
    client_ip_address: clientIp(request),
    client_user_agent: request.headers.get('user-agent') || undefined,
    fbp: cookieValue(cookie, '_fbp'),
    fbc: cookieValue(cookie, '_fbc'),
  }

  // Drop empty user_data fields — Meta rejects nulls.
  for (const key of Object.keys(userData)) {
    if (!userData[key]) delete userData[key]
  }

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId.trim(),
        event_source_url: eventSourceUrl || 'https://ebonvaults.com/',
        action_source: 'website',
        user_data: userData,
      },
    ],
    access_token: accessToken,
  }

  const testCode = (process.env.META_CAPI_TEST_EVENT_CODE ?? '').trim()
  if (testCode) {
    payload.test_event_code = testCode
  }

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('[meta-capi] Lead failed', response.status, text.slice(0, 500))
    return { sent: false, reason: 'api_error', status: response.status }
  }

  return { sent: true }
}
