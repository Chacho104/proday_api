import { Router } from "express";

import tasksRouter from "./tasks/tasks";
import usersRouter from "./users";
import subTasksRouter from "./tasks/sub-tasks";
import taskItemsRouter from "./tasks/sub-task-items";

const routes = Router();

// Order of registeration still matters...you want to register open routes first

routes.use(usersRouter);

routes.use(tasksRouter);

routes.use(subTasksRouter);

routes.use(taskItemsRouter);

export default routes;
