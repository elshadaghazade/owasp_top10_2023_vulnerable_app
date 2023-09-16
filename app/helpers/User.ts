import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "abc";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "228b53cd-3499-52co-967d-8601632034078";
const ACCESS_TOKEN_EXPIRATION_TIME = "15m";
const REFRESH_TOKEN_EXPIRATION_TIME = 3600;

export class User {
  private passwordSaltRound = 10;
  constructor(private prisma: PrismaClient) {}

  async create(params: {email: string, password: string, is_admin: boolean}, adminId: number | null) {
    
    this.checkPassword(params.password);
    
    if (adminId) {
      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: adminId,
          is_admin: true
        },
        select: {
          id: true
        }
      });
    } else {
      params.is_admin = false;
    }

    const password = bcrypt.hashSync(params.password, this.passwordSaltRound);

    const user = await this.prisma.user.create({
      data: {
        ...params,
        password
      },
    });

    return {
      id: user.id,
      email: user.email,
      // is_admin: user.is_admin
    }
  }

  async handleLogin(username: string, password: string) {
    
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: username,
              mode: "insensitive"
            },
          }
        ]
      },
      select: {
        id: true,
        email: true,
        password: true,
        is_admin: true,
      }
    });

    if (!user) {
      throw new Error("User Not found");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error("Email/Phone or Password is wrong");
    }
  
    const accessToken = jwt.sign({ id: user.id, is_admin: user.is_admin }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
      // algorithm: 'none'
    });
    
    const refreshToken = jwt.sign({ id: user.id, is_admin: user.is_admin }, REFRESH_TOKEN_SECRET, {
      expiresIn: Math.round(Date.now() / 1000) + REFRESH_TOKEN_EXPIRATION_TIME,
      // algorithm: 'none'
    });
  
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id
      }
    }
  }
  
  async handleRefreshToken (refreshToken: string) {
  
    if (!refreshToken.trim()) {
      throw new Error("Refresh token missing");
    }
  

    // Verify the refresh token and extract the payload
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {
      // algorithms: [
      //   'none'
      // ]
    }) as jwt.JwtPayload;

    // Check if the refresh token is expired
    if (Date.now() >= decoded.exp! * 1000) {
      throw new Error("Refresh token has expired");
    }

    // Retrieve the user's details from the refresh token payload
    const { id, is_admin } = decoded;

    // Generate a new access token
    const accessToken = this.generateAccessToken(id, is_admin);

    return {
      accessToken,
      refreshToken
    }
  }
  
  /**
   * handle token verification request
   */

  async handleVerifyToken (accessToken: string): Promise<{id: number | null, is_admin: boolean | null}> {
    try {
      const payload: any = jwt.verify(accessToken, JWT_SECRET, {
        // algorithms: [
        //   'none'
        // ]
      });
      return {
        id: payload?.id,
        is_admin: payload?.is_admin
      };
    } catch (error) {
      throw new Error("Token is invalid or expired");
    }
  }

  async getUserIdFromAccessToken (accessToken: string) {
    try {
      const payload: jwt.JwtPayload | string = jwt.verify(accessToken, JWT_SECRET, {
        algorithms: [
          'none'
        ]
      });
      if (!(typeof payload === 'string')) {
        return payload.id as number;
      } else {
        throw new Error("Token is invalid or expired");
      }
    } catch (error) {
      throw new Error("Token is invalid or expired");
    }
  }
  
  /**
   * generate access token
   */
  private generateAccessToken(id: number, is_admin: boolean) {
    const accessToken = jwt.sign({ id, is_admin }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
      // // algorithm: 'none'
    });

    return accessToken;
  }

  /** 
   * check password strengthness 
  */ 
  private checkPassword (password: string) {
    let strengthness = {
      level: 0,
      issues: {
        password_length: "",
        upper_case: "",
        lower_case: "",
        digits: "",
        special_symbol: ""
      }
    }

    if (password.length >= 8) {
      strengthness.level++;
    } else {
      strengthness.issues.password_length = "Length of password must not be less than 8 symbols"
    }

    if (/[a-z]/.test(password)) {
      strengthness.level++;
    } else {
      strengthness.issues.lower_case = "Password should contain at least one lower case letter";
    }

    if (/[A-Z]/.test(password)) {
      strengthness.level++;
    } else {
      strengthness.issues.lower_case = "Password should contain at least one upper case letter";
    }

    if (/[0-9]/.test(password)) {
      strengthness.level++;
    } else {
      strengthness.issues.lower_case = "Password should contain at least one digit";
    }

    if (/[\W\_]/.test(password)) {
      strengthness.level++;
    } else {
      strengthness.issues.lower_case = "Password should contain at least one special symbol";
    }

    if (strengthness.level !== 5) {
      throw strengthness;
    }
  }

  /**
   * get all users for administrator
   */
  async getAllUsers () {
    return await this.prisma.user.findMany({
      where: {},
      select: {
        id: true,
        email: true,
        is_admin: true,
      }
    });
  }

  /**
   * adds some amount of money to the balance
   */

  async addToBalance (amount: number, userId: number) {
    const balance = await this.prisma.balance.findFirst({
      where: {
        user_id: userId
      }
    });

    if (!balance) {
      await this.prisma.balance.create({
        data: {
          user_id: userId,
          amount
        }
      });
    } else {
      await this.prisma.balance.update({
        where: {
          id: balance.id,
        },
        data: {
          amount: Number(balance.amount) + amount
        }
      });
    }
  }
}
