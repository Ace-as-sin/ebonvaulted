const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PLANS = new Set(['essential', 'plus', 'premium'])
const INTENDED_USES = new Set(['personal', 'photos', 'business', 'other'])

export function validateWaitlistPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'JSON body must be an object.' }
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) return { ok: false, error: 'Email address is required.' }
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  const plan = typeof body.plan === 'string' ? body.plan.trim() : ''
  if (!PLANS.has(plan)) {
    return { ok: false, error: 'Select a preferred storage plan.' }
  }

  const intendedUse =
    typeof body.intendedUse === 'string' ? body.intendedUse.trim() : ''
  if (!INTENDED_USES.has(intendedUse)) {
    return { ok: false, error: 'Select your primary intended use.' }
  }

  let feedback
  if (body.feedback !== undefined && body.feedback !== null) {
    if (typeof body.feedback !== 'string') {
      return { ok: false, error: 'Feedback must be a string.' }
    }
    const trimmed = body.feedback.trim()
    if (trimmed.length > 1000) {
      return { ok: false, error: 'Feedback must be 1000 characters or fewer.' }
    }
    if (trimmed) feedback = trimmed
  }

  let source
  if (body.source !== undefined && body.source !== null) {
    if (typeof body.source !== 'string') {
      return { ok: false, error: 'Source must be a string.' }
    }
    const trimmed = body.source.trim()
    if (trimmed.length > 2000) {
      return { ok: false, error: 'Source is too long.' }
    }
    if (trimmed) source = trimmed
  }

  let submittedAt =
    typeof body.submittedAt === 'string' ? body.submittedAt.trim() : ''
  if (!submittedAt) {
    submittedAt = new Date().toISOString()
  } else if (Number.isNaN(Date.parse(submittedAt))) {
    return { ok: false, error: 'submittedAt must be a valid ISO timestamp.' }
  }

  return {
    ok: true,
    value: {
      email,
      plan,
      intendedUse,
      feedback,
      source,
      submittedAt,
      receivedAt: new Date().toISOString(),
    },
  }
}
