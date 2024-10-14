import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { opentelemetry } from '@elysiajs/opentelemetry'

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

import { note } from './note'
import { user } from './user'

const app = new Elysia()
    .use(opentelemetry({
      spanProcessors: [
				new BatchSpanProcessor(
					new OTLPTraceExporter({
						url: 'https://api.axiom.co/v1/traces', 
						headers: { 
						    Authorization: `Bearer ${Bun.env.AXIOM_TOKEN}`, 
						    'X-Axiom-Dataset': Bun.env.AXIOM_DATASET!
						} 
					})
				)
			]
    }))
    .use(swagger())
    .onError(({ error, code }) => {
        if (code === 'NOT_FOUND') return 'Not Found :('

        console.error(error)
    })
    .use(user)
    .use(note)
    .listen(3000)