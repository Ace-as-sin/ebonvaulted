import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyInstance } from 'fastify'
import type { DatabaseSync } from 'node:sqlite'
import type { AppConfig } from './config.js'
import { insertWaitlistSignup } from './db.js'
import { waitlistBodySchema } from './schema.js'

export type AppDeps = {
  config: AppConfig
  db: DatabaseSync
}

export async function buildApp(deps: AppDeps): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: 'info',
      // Never log request bodies — redact common sensitive fields if serializers run
      redact: {
        paths: [
          'req.body',
          'req.headers.authorization',
          'body.email',
          'body.feedback',
        ],
        remove: true,
      },
    },
    bodyLimit: deps.config.bodyLimitBytes,
    trustProxy: false,
    requestIdHeader: 'x-request-id',
  })

  await app.register(cors, {
    origin: (origin, callback) => {
      // Allow non-browser tools (no Origin) for local health checks only via same-host
      if (!origin) {
        callback(null, false)
        return
      }
      callback(null, deps.config.corsOrigins.includes(origin))
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 86400,
  })

  await app.register(rateLimit, {
    max: deps.config.rateLimitMax,
    timeWindow: deps.config.rateLimitWindowMs,
    hook: 'preHandler',
    errorResponseBuilder: () => ({
      ok: false,
      error: 'Too many requests. Please try again later.',
    }),
  })

  app.get('/healthz', async () => ({ ok: true }))

  app.post('/api/waitlist', async (request, reply) => {
    const parsed = waitlistBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({
        ok: false,
        error: 'Invalid request. Check your answers and try again.',
      })
    }

    try {
      // Persist (or treat duplicate as success without revealing which)
      insertWaitlistSignup(deps.db, deps.config, parsed.data)
      return reply.code(201).send({ ok: true })
    } catch (error) {
      request.log.error({ err: error }, 'waitlist_persist_failed')
      return reply.code(500).send({
        ok: false,
        error:
          'We could not save your signup right now. Please try again in a moment.',
      })
    }
  })

  app.setErrorHandler((error, request, reply) => {
    const err = error as { statusCode?: number; code?: string }
    if (
      err.statusCode === 413 ||
      err.code === 'FST_ERR_CTP_BODY_TOO_LARGE'
    ) {
      return reply.code(413).send({
        ok: false,
        error: 'Request is too large.',
      })
    }

    request.log.error({ err: error }, 'unhandled_error')
    return reply.code(500).send({
      ok: false,
      error: 'Unexpected server error. Please try again.',
    })
  })

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ ok: false, error: 'Not found' })
  })

  return app
}
