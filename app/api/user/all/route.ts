import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

const administratorsIds = [
    'admin1@gmail.com',
    'admin2@gmail.com',
    'admin3@gmail.com'
];

/**
 * @swagger
 * /api/user/all:
 *    get:
 *     security:
 *      - bearerAuth: []
 *     description: returns users' list for administrator
 *     tags:
 *      - User
 *     
 *     responses:
 *       200:
 *         description: users' list
 */
export async function GET(request: NextRequest) {

  try {

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const id = await user.handleVerifyToken(token!);

    // SOLUTION
    const admin = await prisma.user.findUniqueOrThrow({
        where: {
            id
        },
        select: {
            email: true
        }
    });

    if (!administratorsIds.includes(admin.email)) {
        throw new Error("Forbidden");
    }

    const response = await user.getAllUsers();

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
