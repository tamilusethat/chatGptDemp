# Expenses Calculator (MERN)

A complete full-stack expenses calculator built with:

- **Frontend:** React + Vite + Bootstrap
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose

## Features

- Add, update, and delete expenses
- Optional notes per expense
- Filter expenses by category and month
- View filtered total and overall category-wise summary
- REST API with validation and error handling
- Local development setup (no Docker required)

## Project Structure

- `frontend/` - React UI
- `backend/` - Express API + MongoDB models

## Local Setup

### 1) Start MongoDB locally

Make sure your local MongoDB server is running on:

`mongodb://localhost:27017`

### 2) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

`backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expenses_calculator
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3) Frontend

```bash
cd frontend
npm install
```

Optional frontend env file (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

## API Endpoints

- `GET /api/health`
- `GET /api/expenses?category=<name>&month=YYYY-MM`
- `GET /api/expenses/summary`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Sample Expense Payload

```json
{
  "title": "Groceries",
  "amount": 50.75,
  "category": "Food",
  "date": "2026-01-12",
  "notes": "Weekly fruits and vegetables"
}
```
