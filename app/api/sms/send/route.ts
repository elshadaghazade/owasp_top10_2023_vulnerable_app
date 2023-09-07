import { User } from "@/app/helpers/User";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const user = new User(prisma);

/**
 * @swagger
 * /api/sms/send:
 *    post:
 *     description: Sending sms (one sms per minute)
 *     tags:
 *      - SMS
 *     requestBody:
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      phone:
 *                          type: string
 *     
 *     responses:
 *       200:
 *         description: sends an sms
 */

export function POST (request: NextRequest) {
  return NextResponse.json({
    status: "OK"
  });
}