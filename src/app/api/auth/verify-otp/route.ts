import { NextRequest } from 'next/server'

// Redirect to v1 API
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/v1/auth/verify-otp'

  return fetch(url.toString(), {
    method: 'POST',
    headers: request.headers,
    body: request.body
  })
}
