import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../models/http-error";

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Authorization often comes in the form Authorization: 'Bearer Token'
    if (!token) {
      throw new Error("Authentication failed, token required!");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY!);
    // @ts-ignore to enable dynamically adding data to request object
    req.userData = { userId: decodedToken.userId }; // We know we added userId to token payload when we created it
    next();
  } catch (err) {
    const error = new HttpError(
      "Authentication failed, please try again!",
      401
    );
    return next(error);
  }
};

export default checkAuth;
