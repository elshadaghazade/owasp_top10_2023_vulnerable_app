import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "abc";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "abc";
const ACCESS_TOKEN_EXPIRATION_TIME = process.env.ACCESS_TOKEN_EXPIRATION_TIME || "15m";
const REFRESH_TOKEN_EXPIRATION_TIME = process.env.REFRESH_TOKEN_EXPIRATION_TIME
  ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME)
  : 3600;

export class User {
  private passwordSaltRound = 10;
  constructor(private prisma: PrismaClient) {}

  async create(params: {email: string, password: string}) {
    
    // this.checkPassword(params.password);

    const password = bcrypt.hashSync(params.password, this.passwordSaltRound);

    const user = await this.prisma.user.create({
      data: {
        email: params.email,
        password
      },
    });

    return {
      id: user.id,
      email: user.email
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
        password: true
      }
    });

    if (!user) {
      throw new Error("User Not found");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error("Email/Phone or Password is wrong");
    }
  
    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
      // algorithm: 'none'
    });
    
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
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
    const { id } = decoded;

    // Generate a new access token
    const accessToken = this.generateAccessToken(id);

    return {
      accessToken,
      refreshToken
    }
  }
  
  /**
   * handle token verification request
   */

  async handleVerifyToken (accessToken: string) {
    try {
      const payload: any = jwt.verify(accessToken, JWT_SECRET, {
        // algorithms: [
        //   'none'
        // ]
      });
      return payload?.id;
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
  private generateAccessToken(id: number) {
    const accessToken = jwt.sign({ id }, JWT_SECRET, {
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
}
