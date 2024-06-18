import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
interface AuthenticatedRequest extends Request {
   user?: { id: string; iat?: number; exp?: number };
 }
 
export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const token = req.header('Authorization')?.replace('Bearer', '').trim();

   if(!token){
      return res.status(401).send('Access denied. No token provided.');
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')as { id: string };
      (req as any).user = decoded;
      next();
   } catch (error) {
      res.status(400).send('Invalid token');
   }
}