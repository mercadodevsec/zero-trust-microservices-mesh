import { useEffect, useState } from 'react';
import { api, ApiError } from '../services/api';

interface Order {
  id: number;
  description: string;
  amount: number;
  status: string;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get<Order[]>('/api/orders')
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load orders.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <h1>Orders</h1>
      {error && <p className="form-error">{error}</p>}
      {!orders && !error && <p>Loading orders…</p>}
      {orders && orders.length === 0 && <p>No orders yet.</p>}
      {orders && orders.length > 0 && (
        <ul className="record-list">
          {orders.map((order) => (
            <li key={order.id}>
              #{order.id} — {order.description} — ${order.amount} — {order.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
