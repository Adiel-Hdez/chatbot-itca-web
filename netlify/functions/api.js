import serverless from 'serverless-http'
import { app, initServer } from '../../backend/server.js'

let initialized = false

const handler = serverless(app)

export async function handlerWrapper(event, context) {
  context.callbackWaitsForEmptyEventLoop = false

  if (!initialized) {
    try {
      await initServer()
      initialized = true
    } catch (err) {
      console.error('Error inicializando backend serverless:', err.message)
    }
  }

  return handler(event, context)
}

export { handlerWrapper as handler }
