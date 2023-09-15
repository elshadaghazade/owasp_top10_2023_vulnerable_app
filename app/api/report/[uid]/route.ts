import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/report/{uid}:
 *    post:
 *     security:
 *      - bearerAuth: []
 *     description: Report a user
 *     tags:
 *      - User
 *     parameters:
 *      - in: path
 *        name: uid
 *        type: number
 *        description: user id
 *        required: true
 *      - in: query
 *        name: reason
 *        type: string
 *        description: reason of report
 *     
 *     responses:
 *       200:
 *         description: report response
 */
export async function POST(request: NextRequest, {params: {uid}}: any) {

  try {

    const userId = Number(uid);
    const reason = request.nextUrl.searchParams.get('reason');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const {id: reportedBy, is_admin} = await user.handleVerifyToken(token!);

    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true
        }
    });

    await prisma.report.create({
        data: {
            user_id: userId,
            reported_by: reportedBy!,
            reason
        }
    });

    return NextResponse.json({
        data: "OK",
        error: {
            ...userInfo
        }
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
