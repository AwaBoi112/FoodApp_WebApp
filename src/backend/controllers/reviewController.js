import { supabase } from '../supabaseClient.js';

// a customer rates a delivered order of his own
export const createReview = async (req, res) => {
  const { order_id, rating, comment } = req.body;

  const stars = Number(rating);
  if (!order_id || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Adj meg egy 1 és 5 közötti értékelést.' });
  }

  try {
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_id, restaurant_id, status')
      .eq('id', order_id)
      .maybeSingle();

    // the order must exist and belong to the logged in customer
    if (!order || order.customer_id !== req.user.id) {
      return res.status(404).json({ error: 'Nincs ilyen rendelés.' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ error: 'Csak kiszállított rendelést lehet értékelni.' });
    }

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', order_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Ezt a rendelést már értékelted.' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        order_id,
        customer_id: req.user.id,
        restaurant_id: order.restaurant_id,
        rating: stars,
        comment: comment ? String(comment).slice(0, 250) : null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};