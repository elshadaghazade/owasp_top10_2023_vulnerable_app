import { NextRequest, NextResponse } from "next/server";
import { SMSSendMiddleware } from "./app/middlewares/sms_send_middleware";
import { RequestsRateLimit } from "./app/middlewares/requests_rate_limit";



export async function middleware(request: NextRequest) {
  switch (request.nextUrl.pathname) {
    case '/api/sms/send':
      // return await SMSSendMiddleware(request);
    default:
      // return await RequestsRateLimit(request);
  }
  
}

export const config = {
  matcher: [
    "/api/:path+"
  ],
}