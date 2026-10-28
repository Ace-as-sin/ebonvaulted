import { CONSENT_POLICY_VERSION } from './plans'
import type { WaitlistFormData, WaitlistPayload, WaitlistResult } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * API base URL, e.g. http://127.0.0.1:8787 or https://api.ebonvaults.com
 * Falls back to legacy VITE_WAITLIST_ENDPOINT if it already includes the full path.
 */
export function getApiBaseUrl(): string | undefined {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (base) return base.replace(/\/$/, '')
  return undefined
}

export function getWaitlistEndpoint(): string | undefined {
  const base = getApiBaseUrl()
  if (base) return `${base}/api/waitlist`

  const legacy = (import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined)
    ?.trim()
  if (legacy) return legacy
  return undefined
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

  if (!data.privacyFeature) {
    errors.privacyFeature = 'Select the privacy feature that matters most.'
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
        'Waitlist API is not configured. Set VITE_API_URL to enable submissions.',
    }
  }

  const fieldErrors = validateWaitlistForm(data)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: 'validation',
      error:
        Object.values(fieldErrors)[0] ?? 'Please check the form and try again.',
    }
  }

  const payload: WaitlistPayload = {
    email: data.email.trim().toLowerCase(),
    plan: data.plan,
    intendedUse: data.intendedUse,
    privacyFeature: data.privacyFeature,
    feedback: data.feedback.trim() || undefined,
    consent: true,
    consentPolicyVersion: CONSENT_POLICY_VERSION,
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
      let message =
        'We could not confirm your signup. Your submission was not saved — please try again.'
      try {
        const body = (await response.json()) as { error?: string }
        if (body.error) message = body.error
      } catch {
        // keep default message
      }
      return {
        ok: false,
        code: 'server',
        error: message,
      }
    }

    const body = (await response.json().catch(() => null)) as {
      ok?: boolean
    } | null

    if (!body || body.ok !== true) {
      return {
        ok: false,
        code: 'server',
        error:
          'We could not confirm your signup. Your submission was not saved — please try again.',
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      code: 'offline',
      error:
        'The signup service is unreachable right now. Your submission was not confirmed — check your connection and try again.',
    }
  }
}
