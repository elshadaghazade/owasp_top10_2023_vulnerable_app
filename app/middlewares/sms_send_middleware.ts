import { NextRequest, NextResponse } from "next/server";

const requestCountByIp = new Map();
const maxRequests = 100;
const timeWindow = 60000;

export async function SMSSendMiddleware (request: NextRequest) {
    const ipAddress = (
        request.ip ||
        request.headers.get('x-real-ip') || 
        request.headers.get('x-forwarded-for')
      );
      
      if (!ipAddress) {
        return NextResponse.json({}, {
          status: 400,
          statusText: "Bad request"
        });
      }
    
      if (!requestCountByIp.has(ipAddress)) {
        requestCountByIp.set(ipAddress, {
          count: 1,
          lastRequestTime: Date.now(),
        });
      } else {
        const requestData = requestCountByIp.get(ipAddress);
        if ((Date.now() - requestData.lastRequestTime) >= timeWindow) {
          requestData.count++;
          requestData.lastRequestTime = Date.now();
    
          if (requestData.count > maxRequests) {
            return NextResponse.json({}, {
              status: 429,
              statusText: 'Too many requests. Please try again later.'
            });
          }
        } else {
          return NextResponse.json({}, {
            status: 429,
            statusText: 'Too many requests. Please try again later.'
          });
        }
      }
    
      return NextResponse.next()
}