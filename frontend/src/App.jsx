import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emptyForm = {
  title: '',
  amount: '',
  category: '',
  date: '',
  notes: '',
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ overallTotal: 0, byCategory: [] });
  const [filters, setFilters] = useState({ category: '', month: '' });

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.month) params.append('month', filters.month);
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
  }, [filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/expenses${queryString}`);
      if (!res.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Unable to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/summary`);
      if (!res.ok) {
        throw new Error('Failed to fetch summary');
      }
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Unable to load summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [queryString]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title || !form.amount || !form.category || !form.date) {
      setError('Please fill all required fields.');
      return;
    }

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    try {
      const endpoint = editingId
        ? `${API_BASE_URL}/expenses/${editingId}`
        : `${API_BASE_URL}/expenses`;

      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => ({}));
        throw new Error(maybeJson.message || 'Unable to save expense');
      }

      const saved = await res.json();
      if (editingId) {
        setExpenses((prev) => prev.map((item) => (item._id === editingId ? saved : item)));
      } else {
        setExpenses((prev) => [saved, ...prev]);
      }
      resetForm();
      fetchSummary();
    } catch (err) {
      setError(err.message || 'Unable to save expense');
    }
  };

  const editExpense = (expense) => {
    setEditingId(expense._id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: new Date(expense.date).toISOString().slice(0, 10),
      notes: expense.notes || '',
    });
  };

  const deleteExpense = async (id) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete expense');
      }
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      fetchSummary();
    } catch (err) {
      setError(err.message || 'Unable to delete expense');
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', month: '' });
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h1 className="h3 mb-1">Expenses Calculator</h1>
                <p className="text-muted mb-4">Track, filter, and summarize your expenses.</p>
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input id="title" name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Groceries" />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="amount" className="form-label">Amount *</label>
                    <input id="amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} className="form-control" placeholder="100" />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="date" className="form-label">Date *</label>
                    <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">Category *</label>
                    <input id="category" name="category" value={form.category} onChange={handleChange} className="form-control" placeholder="Food" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <input id="notes" name="notes" value={form.notes} onChange={handleChange} className="form-control" placeholder="Optional note" />
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                      {editingId ? 'Update Expense' : 'Add Expense'}
                    </button>
                    {editingId && (
                      <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Cancel Edit</button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Filters</h2>
                  <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>Clear</button>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="filterCategory" className="form-label">Category</label>
                    <input id="filterCategory" name="category" value={filters.category} onChange={handleFilterChange} className="form-control" placeholder="e.g. Food" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="filterMonth" className="form-label">Month</label>
                    <input id="filterMonth" name="month" type="month" value={filters.month} onChange={handleFilterChange} className="form-control" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Overview</h2>
                  <span className="badge text-bg-success fs-6">Filtered Total: ${total.toFixed(2)}</span>
                </div>
                {summaryLoading ? (
                  <div className="text-muted">Loading summary...</div>
                ) : (
                  <>
                    <p className="mb-2"><strong>Overall Total:</strong> ${Number(summary.overallTotal || 0).toFixed(2)}</p>
                    <div className="d-flex flex-wrap gap-2">
                      {summary.byCategory?.length ? (
                        summary.byCategory.map((item) => (
                          <span key={item.category} className="badge text-bg-primary">
                            {item.category}: ${Number(item.total).toFixed(2)}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No summary yet.</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">Expense History</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {loading && <div className="alert alert-info">Loading expenses...</div>}

                {!loading && expenses.length === 0 && (
                  <div className="alert alert-secondary mb-0">No expenses found.</div>
                )}

                {!loading && expenses.length > 0 && (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>Notes</th>
                          <th className="text-end">Amount</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense) => (
                          <tr key={expense._id}>
                            <td>{expense.title}</td>
                            <td>{expense.category}</td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                            <td>{expense.notes || '-'}</td>
                            <td className="text-end">${Number(expense.amount).toFixed(2)}</td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm" role="group">
                                <button className="btn btn-outline-primary" onClick={() => editExpense(expense)}>
                                  Edit
                                </button>
                                <button className="btn btn-outline-danger" onClick={() => deleteExpense(expense._id)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
