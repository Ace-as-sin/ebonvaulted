import type { WaitlistFormData, WaitlistPayload, WaitlistResult } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getWaitlistEndpoint(): string | undefined {
  const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined
  if (!endpoint || !endpoint.trim()) return undefined
  return endpoint.trim()
}

export function validateWaitlistForm(
  data: WaitlistFormData,
): Partial<Record<keyof WaitlistFormData, string>> {
  const errors: Partial<Record<keyof WaitlistFormData, string>> = {}

  if (!data.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!data.plan) {
    errors.plan = 'Select a preferred storage plan.'
  }

  if (!data.intendedUse) {
    errors.intendedUse = 'Select your primary intended use.'
  }

  if (!data.consent) {
    errors.consent = 'Consent is required to join the waitlist.'
  }

  if (data.feedback.length > 1000) {
    errors.feedback = 'Feedback must be 1000 characters or fewer.'
  }

  return errors
}

export async function submitWaitlist(
  data: WaitlistFormData,
): Promise<WaitlistResult> {
  const endpoint = getWaitlistEndpoint()

  if (!endpoint) {
    return {
      ok: false,
      code: 'not_configured',
      error:
        'Waitlist endpoint is not configured. Set VITE_WAITLIST_ENDPOINT to enable submissions.',
    }
  }

  const fieldErrors = validateWaitlistForm(data)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: 'validation',
      error: Object.values(fieldErrors)[0] ?? 'Please check the form and try again.',
    }
  }

  const payload: WaitlistPayload = {
    email: data.email.trim().toLowerCase(),
    plan: data.plan,
    intendedUse: data.intendedUse,
    feedback: data.feedback.trim() || undefined,
    source: typeof window !== 'undefined' ? window.location.href : undefined,
    submittedAt: new Date().toISOString(),
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        ok: false,
        code: 'server',
        error:
          'We could not complete your signup right now. Please try again in a moment.',
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      code: 'network',
      error:
        'Network error. Check your connection and try again.',
    }
  }
}
