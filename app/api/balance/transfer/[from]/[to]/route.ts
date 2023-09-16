import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { raw } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/balance/transfer/{from}/{to}:
 *    get:
 *     security:
 *      - bearerAuth: []
 *     description: Refresh token
 *     tags:
 *      - User Balance
 *     parameters:
 *      - in: path
 *        name: from
 *        type: number
 *        required: true
 *      - in: path
 *        name: to
 *        type: number
 *        required: true
 *      - in: query
 *        name: amount
 *        type: number
 *        required: true
 *     
 *     responses:
 *       200:
 *         description: user balance
 */
export async function GET(request: NextRequest, {params: {from, to}}: any) {

  try {

    const fromUserId = Number(from);
    const toUserId = Number(to);
    const amount = Number(request.nextUrl.searchParams.get('amount'));

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    const {id, is_admin} = await user.handleVerifyToken(token!);

    if (fromUserId !== id || fromUserId === toUserId || amount <= 0) {
        throw new Error("Forbidden");
    }

    const balanceFrom = await prisma.balance.findFirstOrThrow({
        where: {
            user_id: fromUserId
        },
        select: {
            amount: true
        }
    });

    const balanceTo = await prisma.balance.findFirst({
        where: {
            user_id: toUserId
        },
        select: {
            amount: true,
            id: true
        }
    });

    await prisma.balance.updateMany({
        where: {
            user_id: fromUserId
        },
        data: {
            amount: Number(balanceFrom.amount) - amount
        }
    });

    if (balanceTo) {
        await prisma.balance.update({
            where: {
                id: balanceTo.id
            },
            data: {
                amount: Number(balanceTo.amount) + amount
            }
        });
    } else {
        await prisma.balance.create({
            data: {
                amount: amount,
                user_id: toUserId
            }
        });
    }

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
