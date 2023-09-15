import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/internal_admin:
 *    get:
 *     consumes:
 *      - application/json
 *     description: returns confidential information and can be accessed only in local network
 *     tags:
 *      - Admin
 *
 *     responses:
 *       200:
 *         description: some confidential information
 */


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