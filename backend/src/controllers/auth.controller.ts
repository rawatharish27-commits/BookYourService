
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { env } from "../config/env";
import { AuthService } from "../modules/auth/auth.service"; // Re-using service for business logic consistency

const authService = new AuthService();

// Cookie Options
const ACCESS_COOKIE_OPTS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
};

const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth' // Limit scope
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register((req as any).body);
    (res as any).status(201).json({ 
      success: true, 
      userId: result.id,
      message: "Registered successfully. Please login." 
    });
  } catch (error: any) {
    if (error.code === '23505') { 
        return (res as any).status(409).json({ message: "Email or Phone already exists" });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = (req as any).body;
    
    // Service handles: User lookup, Password check, Lockout logic, Token generation
    const result = await authService.login({ email, password });

    // SET COOKIES
    (res as any).cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTS);
    (res as any).cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);

    (res as any).json({ 
      success: true,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = (req as any).cookies.refreshToken;
        
        if (!refreshToken) {
            return (res as any).status(401).json({ message: "No refresh token provided" });
        }

        // Service handles: Verify, Reuse check, Rotation
        const tokens = await authService.refresh(refreshToken);

        // SET NEW COOKIES
        (res as any).cookie('accessToken', tokens.accessToken, ACCESS_COOKIE_OPTS);
        (res as any).cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTS);

        (res as any).json({ success: true });
    } catch (error) {
        // If refresh fails, clear everything
        (res as any).clearCookie('accessToken');
        (res as any).clearCookie('refreshToken', { path: '/api/auth' });
        next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = (req as any).cookies.refreshToken;
        if (refreshToken) {
            // Best effort: revoke in DB
            await db.query(`UPDATE refresh_tokens SET revoked=true WHERE token=$1`, [refreshToken]);
        }
        
        (res as any).clearCookie('accessToken');
        (res as any).clearCookie('refreshToken', { path: '/api/auth' });
        (res as any).json({ success: true, message: "Logged out" });
    } catch (e) {
        next(e);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Middleware already validated cookie and attached user
        const user = (req as any).user;
        if (!user) return (res as any).status(401).json({ message: "Not authenticated" });
        
        // Fetch fresh details
        const result = await db.query(
            `SELECT u.id, u.name, u.email, u.status, u.verification_status, r.name as role 
             FROM users u 
             JOIN roles r ON r.id = u.role_id 
             WHERE u.id=$1`, 
             [user.id]
        );

        if (result.rowCount === 0) return (res as any).status(401).json({ message: "User not found" });
        
        (res as any).json({ user: result.rows[0] });
    } catch (e) {
        next(e);
    }
};
