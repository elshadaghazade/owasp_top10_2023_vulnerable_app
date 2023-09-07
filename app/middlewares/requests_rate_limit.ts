import { NextRequest, NextResponse } from "next/server"

const requestCountByIp = new Map<
  string,
  { count: number; lastRequestTime: number; timeWindow: number }
>()
const maxRequests = process.env.REQUESTS_RATE_LIMIT
  ? parseInt(process.env.REQUESTS_RATE_LIMIT)
  : 1
const timeWindow = process.env.REQUESTS_RATE_LIMIT_TIME_WINDOW
  ? parseInt(process.env.REQUESTS_RATE_LIMIT_TIME_WINDOW)
  : 3000

export async function RequestsRateLimit(request: NextRequest) {
  if (requestCountByIp.size > 1000_000) {
    requestCountByIp.clear()
  }

  const ipAddress =
    request.ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")

  if (!ipAddress) {
    return NextResponse.json(
      {},
      {
        status: 400,
        statusText: "Bad request",
      }
    )
  }

  if (!requestCountByIp.has(ipAddress)) {
    requestCountByIp.set(ipAddress, {
      count: maxRequests,
      lastRequestTime: Date.now(),
      timeWindow,
    })
  } else {
    const requestData = requestCountByIp.get(ipAddress)!
    if (Date.now() - requestData.lastRequestTime >= requestData.timeWindow) {
      requestData.count = maxRequests
      requestData.lastRequestTime = Date.now()
      requestData.timeWindow = timeWindow
    } else if (requestData.count <= 0) {
      requestData.lastRequestTime = Date.now()
      requestData.timeWindow += 100

      return NextResponse.json(
        {},
        {
          status: 429,
          statusText: "Too many requests. Please try again later.",
        }
      )
    } else {
      requestData.count--
    }
  }

  return NextResponse.next()
}
