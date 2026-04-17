import { Router } from "express";
import { authGuard } from "../middlewares/auth.js";
import {
  listBudget,
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
  summaryBudget,
} from "../controllers/budget.controller.js";

export const budgetRouter = Router();
budgetRouter.use(authGuard);
budgetRouter.get("/", listBudget);
budgetRouter.post("/", createBudget);
budgetRouter.get("/summary", summaryBudget);
budgetRouter.get("/:id", getBudget);
budgetRouter.patch("/:id", updateBudget);
budgetRouter.delete("/:id", deleteBudget);
