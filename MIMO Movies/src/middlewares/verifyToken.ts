import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user";

interface AuthenticatedRequest extends Request {
  userId: number;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await UserModel.findByApiKey(apiKey);

  if (user === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).userId = user.id;

  next();
};
