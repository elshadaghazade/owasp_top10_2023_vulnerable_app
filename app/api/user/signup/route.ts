import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client';
import { User } from "@/app/helpers/User";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/user/signup:
 *    post:
 *     consumes:
 *      - application/json
 *     description: To register a user
 *     tags:
 *      - User
 *     requestBody:
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                  properties:
 *                      email:
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
    
    let adminId: number | null = null;

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token) {
        const result = await user.handleVerifyToken(token!);

        if (result.is_admin) {
            adminId = result.id;
        }
    }

    try {
        const response = await user.create(data, adminId);

        return NextResponse.json({
            data: response,
            error: null
        })
    } catch (err: any) {
        return NextResponse.json({
            error: err.level ? err : "Bad request",
            data: null
        }, {
            status: 400
        });
    }
}
