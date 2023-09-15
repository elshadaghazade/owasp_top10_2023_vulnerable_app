import { NextRequest, NextResponse } from "next/server"
import { getHashCode } from "./requests_rate_limit"

const requestCountByIp = new Map()
const maxRequests = 100
const timeWindow = 60000

export async function SMSSendMiddleware(request: NextRequest) {
  let hashCode = ""

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
      count: 1,
      lastRequestTime: Date.now(),
    })
  } else {
    const requestData = requestCountByIp.get(hashCode)
    if (Date.now() - requestData.lastRequestTime >= timeWindow) {
      requestData.count++
      requestData.lastRequestTime = Date.now()

      if (requestData.count > maxRequests) {
        return NextResponse.json(
          {},
          {
            status: 429,
            statusText: "Too many requests. Please try again later.",
          }
        )
      }
    } else {
      return NextResponse.json(
        {},
        {
          status: 429,
          statusText: "Too many requests. Please try again later.",
        }
      )
    }
  }

  return NextResponse.next()
}
