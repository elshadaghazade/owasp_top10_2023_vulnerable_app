import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    
    const host = request.headers.get('host')!;

    if (![
        "localhost:3000",
        "127.0.0.1:3000"
    ].includes(host)) {
        return NextResponse.json({}, {
            status: 403
        });
    }

    return NextResponse.json({
        data: "List of all confidential information..."
    });
}