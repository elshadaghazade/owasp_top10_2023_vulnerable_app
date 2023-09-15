import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { raw } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/balance/add:
 *    post:
 *     security:
 *      - bearerAuth: []
 *     description: Refresh token
 *     tags:
 *      - User Balance
 *     requestBody:
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      amount:
 *                          type: number
 *     
 *     responses:
 *       200:
 *         description: add some amount of money to user's balance
 */
export async function POST(request: NextRequest) {

  try {

    const payload = await request.json();
    const amount = payload.amount;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const {id, is_admin} = await user.handleVerifyToken(token!);

    await user.addToBalance(amount, id!);

    return NextResponse.json({
        data: "OK",
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
