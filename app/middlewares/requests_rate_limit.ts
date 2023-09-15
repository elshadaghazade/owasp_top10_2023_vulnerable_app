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


export function getHashCode(request: NextRequest) {
  const ip =
    request.ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")

  if (!ip) {
    throw new Error("Ip is wrong")
  }

  const userAgent = request.headers.get("user-agent")

  if (!userAgent) {
    throw new Error("user agent is empty")
  }

  const token = request.headers.get("Authorization") || ""

  return Buffer.from(ip + userAgent + token).toString("base64")
}

export async function RequestsRateLimit(request: NextRequest) {
  if (requestCountByIp.size > 1000_000) {
    requestCountByIp.clear()
  }

  let hashCode = "";

  try {
    hashCode = getHashCode(request)
  } catch {
    return NextResponse.json(
      {},
      {
        status: 400,
        statusText: "Bad request",
      }
    )
  }

  if (!hashCode) {
    return NextResponse.json(
      {},
      {
        status: 400,
        statusText: "Bad request",
      }
    )
  }

  if (!requestCountByIp.has(hashCode)) {
    requestCountByIp.set(hashCode, {
      count: maxRequests,
      lastRequestTime: Date.now(),
      timeWindow,
    })
  } else {
    const requestData = requestCountByIp.get(hashCode)!
    if (Date.now() - requestData.lastRequestTime >= requestData.timeWindow) {
      requestData.count = maxRequests
      requestData.lastRequestTime = Date.now()
      requestData.timeWindow = timeWindow
    } else if (requestData.count <= 0) {
      requestData.lastRequestTime = Date.now()

      if (requestData.timeWindow < 30000) {
        requestData.timeWindow += 100
      }

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
