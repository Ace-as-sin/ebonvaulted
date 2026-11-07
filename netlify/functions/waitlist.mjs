import { isDryRun, json, requireStatusToken } from './lib/http.mjs'
import { sendMetaLead } from './lib/metaCapi.mjs'
import { appendSignup, assertWritable } from './lib/store.mjs'
import { validateWaitlistPayload } from './lib/validate.mjs'

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405)
  }

  const dryRun = isDryRun(request)
  if (dryRun && !requireStatusToken(request)) {
    return json({ ok: false, error: 'Unauthorized dry-run.' }, 401)
  }

  let parsed
  try {
    parsed = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400)
  }

  const validated = validateWaitlistPayload(parsed)
  if (!validated.ok) {
    return json({ ok: false, error: validated.error }, 400)
  }

  try {
    if (dryRun) {
      await assertWritable()
      return json({
        ok: true,
        dryRun: true,
        validated: true,
        writable: true,
        checkedAt: new Date().toISOString(),
      })
    }

    await appendSignup(validated.value)

    // Fire-and-forget CAPI Lead with the same event id as the browser Pixel.
    // Never block signup success on Meta API failures.
    try {
      await sendMetaLead({
        request,
        eventId: validated.meta?.metaEventId,
        trackingAllowed: validated.meta?.trackingAllowed,
        eventSourceUrl: validated.value.source,
      })
    } catch (err) {
      console.error('[waitlist] meta capi error', err)
    }

    return json({ ok: true })
  } catch (err) {
    console.error('[waitlist]', err)
    return json(
      {
        ok: false,
        error: dryRun
          ? 'Data store is not writable.'
          : 'Failed to persist signup.',
      },
      500,
    )
  }
}
