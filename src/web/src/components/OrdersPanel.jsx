import { useState, useEffect, useCallback } from "react";
import { fetchRestaurantOrders, changeOrderStatus } from "../services/api";
import { statusLabels, nextStep } from "../data/orderStatus";
import "../pages/OrdersPage.css";

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load the orders of the restaurant
  const load = useCallback(async () => {
    try {
      setOrders(await fetchRestaurantOrders());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // first load, then refresh every 10 seconds
  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  // change the status and reload the list
  async function handleStatus(orderId, status) {
    try {
      await changeOrderStatus(orderId, status);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="panel">
      <h2>Rendelések ({orders.length})</h2>

      {loading ? (
        <p className="panel-empty">Betöltés...</p>
      ) : error ? (
        <p className="panel-empty">{error}</p>
      ) : orders.length === 0 ? (
        <p className="panel-empty">Még nem érkezett rendelés.</p>
      ) : (
        <div className="row-list">
          {orders.map((order) => {
            const next = nextStep[order.status];
            const canCancel =
              order.status === "PENDING" || order.status === "ACCEPTED";

            return (
              <article className="row-item order-row" key={order.id}>
                <div className="row-main">
                  <h3>
                    {order.customerName} · {order.total} lej
                  </h3>
                  <p>
                    {new Date(order.createdAt).toLocaleString("hu-HU")} ·{" "}
                    {order.address}
                  </p>
                  <p>
                    {order.items
                      .map((item) => `${item.qty} × ${item.name}`)
                      .join(", ")}
                  </p>
                  <div className="row-tags">
                    <span className={`status status-${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                <div className="row-actions">
                  {next && (
                    <button
                      className="mini-button"
                      onClick={() => handleStatus(order.id, next.status)}
                    >
                      {next.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      className="mini-button danger"
                      onClick={() => handleStatus(order.id, "CANCELLED")}
                    >
                      Lemondás
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default OrdersPanel;