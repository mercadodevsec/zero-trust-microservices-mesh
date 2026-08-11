import { useState } from 'react';
import type { FormEvent } from 'react';
import { api, ApiError } from '../services/api';

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
}

export function Payments() {
  const [orderId, setOrderId] = useState('');
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get<Payment[]>(`/api/payments?orderId=${encodeURIComponent(orderId)}`);
      setPayments(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load payments.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Payments</h1>
      <form onSubmit={handleSearch} className="inline-form">
        <label htmlFor="orderId">Order ID</label>
        <input
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. 1"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
      {payments && payments.length === 0 && <p>No payments found for that order.</p>}
      {payments && payments.length > 0 && (
        <ul className="record-list">
          {payments.map((payment) => (
            <li key={payment.id}>
              #{payment.id} — order {payment.orderId} — ${payment.amount} — {payment.method} —{' '}
              {payment.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
