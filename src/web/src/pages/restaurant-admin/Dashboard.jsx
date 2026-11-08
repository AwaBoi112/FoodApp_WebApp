import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useData } from "../../context/DataContext";
import OrdersPanel from "../../components/OrdersPanel";
import JobsPanel from "../../components/JobsPanel";
import "../Dashboard.css";

// empty form values for a new menu item
const emptyItem = {
  name: "",
  description: "",
  price: "",
  category: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

function RestaurantDashboard() {
  const { myRestaurant: restaurant, addMenuItem, removeMenuItem } = useData();

  const [form, setForm] = useState(emptyItem);

  // accounts made before the codes were linked have no restaurant
  if (!restaurant) {
    return (
      <main className="dash">
        <div className="dash-header">
          <span className="eyebrow">ÉTTEREM ADMIN</span>
          <h1>Nem találjuk az éttermedet</h1>
          <p>
            Ehhez a fiókhoz nincs étterem kapcsolva. Lépj ki, és regisztrálj újra
            egy érvényes étterem kóddal.
          </p>
        </div>
      </main>
    );
  }

  // update one field of the form
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // add the new item to the menu
  async function handleAddItem(event) {
    event.preventDefault();

    await addMenuItem({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    });

    // keep the category so several items of the same group are quick to add
    setForm({ ...emptyItem, category: form.category });
  }

  // delete an item after confirmation
  function handleRemoveItem(item) {
    if (window.confirm(`Biztosan törlöd: ${item.name}?`)) {
      removeMenuItem(item.id);
    }
  }

  // group the menu by category, keeping the original order
  const groups = restaurant.menu.reduce((result, item) => {
    if (!result[item.category]) result[item.category] = [];
    result[item.category].push(item);
    return result;
  }, {});

  // existing categories are suggested in the category field
  const categoryNames = Object.keys(groups);

  return (
    <main className="dash">
      <div className="dash-header">
        <span className="eyebrow">ÉTTEREM ADMIN</span>
        <h1>
          {restaurant.emoji} {restaurant.name}
        </h1>
        <p>
          {restaurant.menu.length} étel az étlapon ·{" "}
          <Link className="inline-link" to={`/restaurant/${restaurant.id}`}>
            Így látják a vásárlók <ExternalLink size={14} />
          </Link>
        </p>
      </div>

      {/* add item */}
      <section className="panel">
        <h2>Új étel hozzáadása</h2>

        <form className="form-grid" onSubmit={handleAddItem}>
          <label className="field">
            <span>Étel neve</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Pl. Marinara"
              maxLength={50}
              required
            />
          </label>

          <label className="field">
            <span>Kategória</span>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              list="menu-categories"
              placeholder="Pl. Pizzák"
              required
            />
            <datalist id="menu-categories">
              {categoryNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>

          <label className="field form-wide">
            <span>Leírás</span>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Pl. Paradicsomszósz, fokhagyma, oregánó"
              maxLength={150}
            />
          </label>

          <label className="field">
            <span>Ár (lej)</span>
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Kalória (kcal)</span>
            <input
              type="number"
              min="0"
              name="calories"
              value={form.calories}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Fehérje (g)</span>
            <input
              type="number"
              min="0"
              name="protein"
              value={form.protein}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Szénhidrát (g)</span>
            <input
              type="number"
              min="0"
              name="carbs"
              value={form.carbs}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Zsír (g)</span>
            <input
              type="number"
              min="0"
              name="fat"
              value={form.fat}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-button form-wide" type="submit">
            <Plus size={18} /> Étel hozzáadása
          </button>
        </form>
      </section>

      {/* current menu */}
      <section className="panel">
        <h2>Az étlapod</h2>

        {restaurant.menu.length === 0 ? (
          <p className="panel-empty">Még nincs étel az étlapon.</p>
        ) : (
          Object.entries(groups).map(([groupName, items]) => (
            <div className="menu-admin-group" key={groupName}>
              <h3 className="group-title">{groupName}</h3>

              <div className="row-list">
                {items.map((item) => (
                  <article className="row-item" key={item.id}>
                    <div className="row-main">
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                      <div className="row-tags">
                        <span className="badge badge-role">{item.price} lej</span>
                        <span className="badge badge-macro">
                          {item.calories} kcal
                        </span>
                        <span className="badge badge-macro">
                          F {item.protein} g
                        </span>
                        <span className="badge badge-macro">
                          Sz {item.carbs} g
                        </span>
                        <span className="badge badge-macro">
                          Zs {item.fat} g
                        </span>
                      </div>
                    </div>

                    <div className="row-actions">
                      <button
                        className="icon-button danger"
                        onClick={() => handleRemoveItem(item)}
                        aria-label="Törlés"
                        title="Törlés"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* incoming orders with status buttons */}
      <OrdersPanel />

      {/* job posts and applicants */}
      <JobsPanel restaurantId={restaurant.id} />
    </main>
  );
}

export default RestaurantDashboard;