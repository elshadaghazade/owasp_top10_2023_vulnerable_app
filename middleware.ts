import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth';
 
// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: [
    '/api/hello'
  ],
}

export class MyRequest extends NextRequest {
  user_id!: number;
}
 
export function middleware(request: MyRequest) {

  request.user_id = 1000;

  request.headers.set('aaaa', 'bbb')
    
  // Call our authentication function to check the request
  // if (!isAuthenticated(request)) {
  //   // Respond with JSON indicating an error message
  //   return new NextResponse(
  //     JSON.stringify({ success: false, message: 'authentication failed' }),
  //     { status: 401, headers: { 'content-type': 'application/json' } }
  //   )
  // }
}