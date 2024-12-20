// Define the node.js server
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import taskRouter from "./routes/task.router";

const app = express();

// Middleware for parsing json data from incoming requests: application/json
app.use(bodyParser.json());

// General middlware for setting CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(taskRouter);

// Error-handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "An unexpected error occurred" });
});

app.listen(8080);
