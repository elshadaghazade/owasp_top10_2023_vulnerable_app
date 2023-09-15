import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client';
import { User } from "@/app/helpers/User";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/user/profile/picture/upload:
 *    post:
 *     security:
 *      - bearerAuth: []
 *     consumes:
 *      - application/json
 *     description: To upload a picture
 *     tags:
 *      - User
 *     requestBody:
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      url:
 *                          type: string
 *
 *     responses:
 *       200:
 *         description: 
 */

function checkUrl (url: string) {
    const parsedURL = new URL(url);
    
    if (!['http:', 'https:'].includes(parsedURL.protocol.toLowerCase())) {
        throw new Error("Protocol is wrong");
    }

    if (!(!parsedURL.port || parsedURL.port === "80" || parsedURL.port === "443")) {
        throw new Error("Port is wrong");
    }
}

export async function POST(request: NextRequest) {
    const data = await request.json();

    try {
        checkUrl(data.url);

        const controller = new AbortController();
        // setTimeout(() => controller.abort(), 3000);
        const payload = await fetch(data.url, {
            // signal: controller.signal
        });

        if (!payload.headers.get('content-type')?.toLocaleLowerCase().startsWith('image/')) {
            throw new Error("File is not image");
        }

        // do something with payload

        return NextResponse.json({
            stauts: "OK"
        });
    } catch (err: any) {
        // burada error haqda məlumatı istifadəçiyə olduğu kimi göndərməyin, çaşdırın!
        return NextResponse.json({
            error: {
                message: err.toString(),
                cause: err.cause,
                code: err.code
            },
            data: null
        }, {
            status: 400
        });
    }
}
