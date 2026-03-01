import Expense from '../models/Expense.js';

const requiredFieldsMissing = ({ title, amount, category, date }) => {
  return !title || amount === undefined || amount === null || Number.isNaN(Number(amount)) || !category || !date;
};

export const getExpenses = async (req, res) => {
  const { category, month } = req.query;
  const query = {};

  if (category) {
    query.category = category;
  }

  if (month) {
    const [year, monthNum] = month.split('-').map(Number);
    if (year && monthNum) {
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 1);
      query.date = { $gte: start, $lt: end };
    }
  }

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
  res.json(expenses);
};

export const createExpense = async (req, res) => {
  const { title, amount, category, date, notes } = req.body;

  if (requiredFieldsMissing({ title, amount, category, date })) {
    return res.status(400).json({ message: 'title, amount, category and date are required.' });
  }

  const expense = await Expense.create({
    title: String(title).trim(),
    amount: Number(amount),
    category: String(category).trim(),
    date,
    notes: notes ? String(notes).trim() : '',
  });

  return res.status(201).json(expense);
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, notes } = req.body;

  if (requiredFieldsMissing({ title, amount, category, date })) {
    return res.status(400).json({ message: 'title, amount, category and date are required.' });
  }

  const updated = await Expense.findByIdAndUpdate(
    id,
    {
      title: String(title).trim(),
      amount: Number(amount),
      category: String(category).trim(),
      date,
      notes: notes ? String(notes).trim() : '',
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  return res.json(updated);
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const deleted = await Expense.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  return res.status(204).send();
};

export const getExpenseSummary = async (req, res) => {
  const summary = await Expense.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: { $round: ['$total', 2] },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  const [{ overallTotal = 0 } = {}] = await Expense.aggregate([
    { $group: { _id: null, overallTotal: { $sum: '$amount' } } },
    { $project: { _id: 0, overallTotal: { $round: ['$overallTotal', 2] } } },
  ]);

  return res.json({ overallTotal, byCategory: summary });
};
