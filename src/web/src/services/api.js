import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

// one request helper, it adds the login token when there is one
async function request(method, path, body) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.error || "Hiba történt.");
  return json;
}

const get = (path) => request("GET", path);

// ---------- mapping database rows to the shape of the react pages ----------

function mapMenuItem(item) {
  return {
    ...item,
    description: item.description || "",
    calories: item.calories ?? 0,
    protein: item.protein ?? 0,
    carbs: item.carbs ?? 0,
    fat: item.fat ?? 0,
  };
}

export function mapRestaurant(row) {
  const min = row.delivery_time_min;
  const max = row.delivery_time_max;

  return {
    id: row.id,
    name: row.name,
    category: row.category || "Egyéb",
    image: row.image_url,
    rating: row.rating ?? 0,
    time: min && max ? `${min}–${max} perc` : "Nincs adat",
    fee: `${row.delivery_fee ?? 0} lej`,
    active: row.is_approved,
  };
}

// restaurant with the admin only fields
function mapAdminRestaurant(row) {
  return {
    ...mapRestaurant(row),
    code: row.invite_code,
    ownerId: row.owner_id,
    menu: (row.menu_items || []).map(mapMenuItem),
  };
}

function mapOrder(row) {
  const items = (row.order_items || []).map((item) => ({
    // the menu item id is used so the reorder fills the cart correctly
    id: item.menu_item_id,
    name: item.menu_items?.name || "Törölt étel",
    description: item.menu_items?.description || "",
    category: item.menu_items?.category || "",
    price: item.price_at_time,
    qty: item.quantity,
    calories: item.menu_items?.calories ?? 0,
    protein: item.menu_items?.protein ?? 0,
    carbs: item.menu_items?.carbs ?? 0,
    fat: item.menu_items?.fat ?? 0,
  }));

  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurants?.name || "Étterem",
    restaurantEmoji: "🍽️",
    items,
    deliveryFee: row.delivery_fee ?? 0,
    total: row.total_price,
    calories: row.total_calories ?? 0,
    address: row.delivery_address,
    status: row.status,
    createdAt: row.created_at,
    customerName: row.profiles?.full_name || "Vásárló",
  };
}

// ---------- public ----------

export async function fetchRestaurants() {
  const rows = await get("/api/restaurants");
  return rows.map(mapRestaurant);
}

export async function fetchRestaurant(id) {
  const [row, menu] = await Promise.all([
    get(`/api/restaurants/${id}`),
    get(`/api/restaurants/${id}/menu`),
  ]);

  return { ...mapRestaurant(row), menu: menu.map(mapMenuItem) };
}

// ---------- auth ----------

export function registerAccount(values) {
  return request("POST", "/api/auth/register", values);
}

export function fetchMe() {
  return get("/api/auth/me");
}

// ---------- orders ----------

export async function fetchMyOrders(userId) {
  const rows = await get(`/api/orders/user/${userId}`);
  return rows.map(mapOrder);
}

// the customer id comes from the token on the backend
export function createOrder({ restaurantId, address, items, deliveryFee }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const calories = items.reduce((sum, i) => sum + i.calories * i.qty, 0);

  return request("POST", "/api/orders", {
    restaurant_id: restaurantId,
    delivery_address: address,
    delivery_fee: deliveryFee,
    total_price: subtotal + deliveryFee,
    total_calories: calories,
    items: items.map((i) => ({
      menu_item_id: i.id,
      quantity: i.qty,
      price: i.price,
    })),
  });
}

// ---------- super admin ----------

export async function fetchAdminRestaurants() {
  const rows = await get("/api/manage/restaurants");
  return rows.map(mapAdminRestaurant);
}

export async function createRestaurant({ name, category, fee, time, image }) {
  // "20–30 perc" becomes 20 and 30
  const [minTime, maxTime] = time.match(/\d+/g) || [20, 30];

  const row = await request("POST", "/api/manage/restaurants", {
    name,
    category,
    fee,
    minTime: Number(minTime),
    maxTime: Number(maxTime),
    image,
  });
  return mapAdminRestaurant(row);
}

export function toggleRestaurant(id) {
  return request("PATCH", `/api/manage/restaurants/${id}/toggle`);
}

export function deleteRestaurant(id) {
  return request("DELETE", `/api/manage/restaurants/${id}`);
}

export async function fetchUsers() {
  const rows = await get("/api/manage/users");
  return rows.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    role: u.role,
  }));
}

export function deleteUser(id) {
  return request("DELETE", `/api/manage/users/${id}`);
}

// ---------- restaurant admin ----------

export async function fetchMine() {
  const row = await get("/api/manage/mine");
  return row ? mapAdminRestaurant(row) : null;
}

export function addMenuItem(item) {
  return request("POST", "/api/manage/mine/menu", item);
}

export function deleteMenuItem(itemId) {
  return request("DELETE", `/api/manage/mine/menu/${itemId}`);
}

// orders of my restaurant
export async function fetchRestaurantOrders() {
  const rows = await get("/api/orders/restaurant");
  return rows.map(mapOrder);
}

// change the status of an order
export function changeOrderStatus(orderId, status) {
  return request("PATCH", `/api/orders/${orderId}/status`, { status });
}