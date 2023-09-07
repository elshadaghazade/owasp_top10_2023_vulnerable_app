import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/user/login:
 *    post:
 *     consumes:
 *      - application/json
 *     description: To login a user
 *     tags:
 *      - User
 *     requestBody:
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  required:
 *                      - username
 *                      - password
 *                  properties:
 *                      username:
 *                          type: string
 *                      password:
 *                          type: string
 *                          format: password
 *
 *     responses:
 *       200:
 *         description: accessToken and refreshToken
 */
export async function POST(request: NextRequest) {
    const data = await request.json();

    try {
        const response = await user.handleLogin(data.username, data.password);

        return NextResponse.json({
            data: response,
            error: null
        });
    } catch(err: any) {
        return NextResponse.json({
            error: err.toString(),
            data: null
        }, {
            status: 500
        });
    }
}
