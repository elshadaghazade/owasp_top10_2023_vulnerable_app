import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/balance/{uid}:
 *    get:
 *     security:
 *      - bearerAuth: []
 *     description: Refresh token
 *     tags:
 *      - User Balance
 *     parameters:
 *      - in: path
 *        name: uid
 *        type: number
 *        required: true
 *     
 *     responses:
 *       200:
 *         description: user balance
 */
export async function GET(request: NextRequest, {params: {uid}}: any) {

  try {

    const userId = Number(uid);
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const {id, is_admin} = await user.handleVerifyToken(token!);

    // SOLUTION
    if (userId !== id) {
        throw new Error("Forbidden");
    }

    const response = await prisma.balance.findFirstOrThrow({
        where: {
            user_id: userId
        },
        select: {
            amount: true
        }
    })

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
