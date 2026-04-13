type StreamController = ReadableStreamDefaultController<Uint8Array>

export const clients = new Set<StreamController>()

export function notifyClients(transaction: Record<string, unknown>) {
  const data = `data: ${JSON.stringify(transaction)}\n\n`
  const encoded = new TextEncoder().encode(data)

  for (const controller of Array.from(clients)) {
    try {
      controller.enqueue(encoded)
    } catch {
      clients.delete(controller)
    }
  }
}
