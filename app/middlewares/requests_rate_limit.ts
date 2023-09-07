import { NextRequest, NextResponse } from "next/server"

const requestCountByIp = new Map()
const maxRequests = process.env.REQUESTS_RATE_LIMIT
  ? parseInt(process.env.REQUESTS_RATE_LIMIT)
  : 1
const timeWindow = process.env.REQUESTS_RATE_LIMIT_TIME_WINDOW ? parseInt(process.env.REQUESTS_RATE_LIMIT_TIME_WINDOW) : 3000;

export async function RequestsRateLimit(request: NextRequest) {
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
    })
  } else {
    const requestData = requestCountByIp.get(ipAddress)
    if (Date.now() - requestData.lastRequestTime >= timeWindow) {
      requestData.count = maxRequests
      requestData.lastRequestTime = Date.now()
    } else if (requestData.count <= 0) {
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
