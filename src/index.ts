import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

import routes from "./routes";
import { HttpError } from "./models/http-error";

const app = express();

// Application-level cookie-parser middleware to parse cookies
app.use(cookieParser());

// Application-level middleware for parsing json data from incoming requests: application/json
app.use(express.json());

// Application-level middlware for setting CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(routes);

// Middleware for handling errors or unsupported routes
app.use((req, res, next) => {
  throw new HttpError("Could not find this route!", 404);
});

// Global error-handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // Check if response has already been sent - call next and pass error
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" }); // Check if error coming in has a code, else set 500 and pass error object
});

app.listen(8080);
