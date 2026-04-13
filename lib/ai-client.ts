const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://localhost:8001'

const TIMEOUT_MS = 5000

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function scoreTransaction(transactionData: Record<string, unknown>) {
  const response = await fetchWithTimeout(
    `${AI_SERVICE_URL}/api/score-transaction`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    }
  )

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function analyzeCommunication(communicationData: Record<string, unknown>) {
  const response = await fetchWithTimeout(
    `${AI_SERVICE_URL}/api/analyze-communication`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(communicationData),
    }
  )

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function detectVoicePattern(voiceData: Record<string, unknown>) {
  const response = await fetchWithTimeout(
    `${AI_SERVICE_URL}/api/detect-voice-pattern`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voiceData),
    }
  )

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getModelMetrics() {
  const response = await fetchWithTimeout(
    `${AI_SERVICE_URL}/api/model-metrics`,
    { method: 'GET' }
  )

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
