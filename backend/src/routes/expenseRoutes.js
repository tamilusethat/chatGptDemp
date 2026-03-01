import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpenseSummary,
  getExpenses,
  updateExpense,
} from '../controllers/expenseController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getExpenses));
router.get('/summary', asyncHandler(getExpenseSummary));
router.post('/', asyncHandler(createExpense));
router.put('/:id', asyncHandler(updateExpense));
router.delete('/:id', asyncHandler(deleteExpense));

export default router;
