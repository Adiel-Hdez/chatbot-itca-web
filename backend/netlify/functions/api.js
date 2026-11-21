import serverless from 'serverless-http'
import { app, initServer } from '../../server.js'

let initialized = false

const handler = serverless(app)

export async function handlerWrapper(event, context) {
  context.callbackWaitsForEmptyEventLoop = false

  if (!initialized) {
    await initServer()
    initialized = true
  }

  return handler(event, context)
}

export { handlerWrapper as handler }
