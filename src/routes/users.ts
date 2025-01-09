import { Router } from "express";
import { checkSchema } from "express-validator";

import { getUser, login, signup } from "../controllers/users";
import checkAuth from "../middleware/check-auth";
import { userValidationSchema } from "../lib/validationSchemas";

const usersRouter = Router();

// POST /api/signup
usersRouter.post("/api/signup", checkSchema(userValidationSchema), signup);

// POST /api/login
usersRouter.post("/api/login", checkSchema(userValidationSchema), login);

// Auth middleware to protect below route
usersRouter.use(checkAuth);

// GET /api/user
usersRouter.get("/api/user", getUser);

export default usersRouter;
