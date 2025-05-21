import { NextFunction, Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { HttpError } from "../models/http-error";

import { PrismaClient } from "../../dist/generated/prisma";

const prisma = new PrismaClient();

// Sign up regular auth users - email and password
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Perform validation/sanitization using express-validator
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to sign up with invalid inputs. Please try again!",
      400
    );
    return next(error);
  }

  // Extract validated data from req object and build a data object
  const data = matchedData(req);

  // Extract needed properties from validated data object
  const { email, password } = data;

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await prisma.user.findFirst({ where: { email } });
  } catch (err) {
    const error = new HttpError(
      "Creating user failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exists, please login instead!",
      422
    );
    return next(error);
  }

  // If user does not exist, proceed to create a new user
  // First hash the plain text password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Creating user failed, please try again later.",
      500
    );
    return next(error);
  }

  // Then try creating the user in the database
  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        email,
        authMethods: {
          create: { provider: "email", hashedPassword: hashedPassword },
        },
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Creating user failed, please try again later.",
      500
    );
    return next(error);
  }

  // Generate token and return a token and user id to the frontend
  let token;

  try {
    token = jwt.sign({ userId: newUser.id }, process.env.JWT_PRIVATE_KEY!, {
      expiresIn: "7d",
    });
  } catch (err) {
    const error = new HttpError(
      "Creating user failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ token: token });
};

// Log in regular users - email and password using passport local strategy
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Perform validation/sanitization using express-validator
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to log in with invalid inputs. Please try again!",
      400
    );
    return next(error);
  }

  // Extract validated data from req object and build a data object
  const data = matchedData(req);

  // Extract needed properties from validated data object
  const { email, password } = data;

  let userWithAuthMethod;
  // The logic here is a bit complex
  // First we need to get a user and include authMethods array
  try {
    userWithAuthMethod = await prisma.user.findUnique({
      where: { email },
      include: {
        authMethods: true,
      },
    });
  } catch (err) {
    const error = new HttpError("Login failed, please try again later.", 500);
    return next(error);
  }
  // No user found error
  if (!userWithAuthMethod) {
    const error = new HttpError(
      "User not found, please try different credentials or sign up!",
      404
    );
    return next(error);
  }

  // Next we need to ensure that we attempt this authentication only on users whose authMethod is set to email
  // Ensure auth method is email
  const authMethod = userWithAuthMethod.authMethods.find(
    (method) => method.provider === "email"
  );

  // Ensure auth method is email and there is a password: basis for email/password authentication
  if (!authMethod || !authMethod.hashedPassword) {
    const error = new HttpError("Invalid authentication method", 400);
    return next(error);
  }

  // Now we can verify password
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, authMethod.hashedPassword);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "No user exists with the provided credentials!",
      401
    );
    return next(error);
  }

  // Generate token and return a token and user id to the frontend
  let token;

  try {
    token = jwt.sign(
      { userId: userWithAuthMethod.id },
      process.env.JWT_PRIVATE_KEY!,
      {
        expiresIn: "7d",
      }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    userId: userWithAuthMethod.id,
    token: token,
  });
};

// Get authenticated user

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore since we know there's a userId from decoded token and this route is protected by checkAuth middleware
  const userId = req.userData.userId;
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }
  // No user found error
  if (!user) {
    const error = new HttpError("User not found!", 404);
    return next(error);
  }

  res.status(200).json({
    user: user,
  });
};
