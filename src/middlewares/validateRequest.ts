
import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.body);
    
    if (!parseResult.success) { 
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }
    req.body = parseResult.data; 
    next();
  };


  
