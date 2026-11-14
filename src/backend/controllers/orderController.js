import { supabase } from '../supabaseClient.js';

export const createOrder = async (req, res) => {
  const {
    restaurant_id,
    delivery_address,
    delivery_fee,
    total_price,
    total_calories,
    items,
  } = req.body;

  if (!restaurant_id || !delivery_address || !items || items.length === 0) {
    return res.status(400).json({
      error: 'Hiányzó adatok a rendelés leadásához (restaurant_id, delivery_address, items)!',
    });
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: req.user.id,
          restaurant_id,
          delivery_address,
          delivery_fee: delivery_fee || 0,
          total_price,
          total_calories: total_calories || null,
          status: 'PENDING',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItemsToInsert = items.map((item) => ({
      order_id: orderData.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    res.status(201).json({
      message: 'Rendelés sikeresen rögzítve!',
      order: orderData,
    });
  } catch (err) {
    console.error('Rendelési hiba:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  const { userId } = req.params;

  // customers can only read their own orders
  if (userId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nincs jogosultságod.' });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurants(name, category), reviews(rating, comment), order_items(*, menu_items(*))')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// orders of the restaurant of the logged in restaurant admin
export const getRestaurantOrders = async (req, res) => {
  try {
    const { data: mine } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', req.user.id)
      .maybeSingle();

    if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles!orders_customer_id_fkey(full_name), order_items(*, menu_items(*))')
      .eq('restaurant_id', mine.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// allowed status changes for a restaurant
const allowedChanges = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
};

// change the status of an order of the own restaurant
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data: mine } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', req.user.id)
      .maybeSingle();

    if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, restaurant_id')
      .eq('id', id)
      .maybeSingle();

    // the order must exist and belong to this restaurant
    if (!order || order.restaurant_id !== mine.id) {
      return res.status(404).json({ error: 'Nincs ilyen rendelés.' });
    }

    const allowed = allowedChanges[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Ez az állapotváltás nem megengedett.' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Állapot frissítve.', status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};