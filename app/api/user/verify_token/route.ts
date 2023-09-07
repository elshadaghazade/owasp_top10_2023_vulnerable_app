import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/user/verify_token:
 *    get:
 *     description: Verify token
 *     tags:
 *      - User
 *     parameters:
 *      - in: query
 *        name: token
 *        description: Verifies token
 *        schema:
 *          type: string
 *     
 *     responses:
 *       200:
 *         description: boolean
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  try {
    const response = await user.handleVerifyToken(token!);

    return NextResponse.json({
        data: response,
        error: null
    });
  } catch (err: any) {
    return NextResponse.json({
        error: err.toString(),
        data: null
    }, {
        status: 400
    })
  }
}
