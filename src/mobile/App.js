import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [cartReturnScreen, setCartReturnScreen] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [pendingAdd, setPendingAdd] = useState(null);

  const addToCart = (item, restaurant) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === item.id);
      if (existing) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    setCartRestaurant(restaurant || null);
  };

  const handleAddToCart = (item, restaurant) => {
    const isOtherRestaurant =
      cartItems.length > 0 &&
      cartRestaurant &&
      restaurant &&
      String(cartRestaurant.id) !== String(restaurant.id);

    if (isOtherRestaurant) {
      setPendingAdd({ item, restaurant });
      return false;
    }

    addToCart(item, restaurant);
    return true;
  };

  const confirmReplaceCart = () => {
    if (!pendingAdd) return;
    setCartItems([{ ...pendingAdd.item, quantity: 1 }]);
    setCartRestaurant(pendingAdd.restaurant || null);
    setPendingAdd(null);
  };

  const handleUpdateQuantity = (itemId, change) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
  };

  const openCart = (fromScreen) => {
    setCartReturnScreen(fromScreen);
    setCurrentScreen('cart');
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const cartDeliveryFee =
    cartRestaurant?.delivery_fee != null ? Number(cartRestaurant.delivery_fee) : undefined;

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />

      <View style={[styles.root, currentScreen !== 'home' && styles.hidden]}>
        <HomeScreen
          cartCount={cartCount}
          onNavigateToAuth={() => setCurrentScreen('auth')}
          onNavigateToCart={() => openCart('home')}
          onNavigateToOrders={() => setCurrentScreen('orders')}
          onSelectRestaurant={(id) => {
            setSelectedRestaurantId(id);
            setCurrentScreen('restaurant');
          }}
        />
      </View>

      {currentScreen === 'auth' && (
        <AuthScreen onNavigateToHome={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'restaurant' && (
        <RestaurantDetailScreen
          restaurantId={selectedRestaurantId}
          cartCount={cartCount}
          onBack={() => setCurrentScreen('home')}
          onNavigateToCart={() => openCart('restaurant')}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentScreen === 'cart' && (
        <CartScreen
          cartItems={cartItems}
          restaurantId={cartRestaurant?.id}
          deliveryFee={cartDeliveryFee}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onBack={() => setCurrentScreen(cartReturnScreen)}
          onOrderSuccess={() => setCurrentScreen('orders')}
        />
      )}

      {currentScreen === 'orders' && (
        <OrdersScreen
          onBack={() => setCurrentScreen('home')}
          onSelectRestaurant={(id) => {
            setSelectedRestaurantId(id);
            setCurrentScreen('restaurant');
          }}
        />
      )}

      <Modal
        transparent
        animationType="fade"
        visible={pendingAdd !== null}
        onRequestClose={() => setPendingAdd(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Új kosár indítása?</Text>
            <Text style={styles.modalText}>
              A kosarad egy másik étterem ételeit tartalmazza
              {cartRestaurant?.name ? ` (${cartRestaurant.name})` : ''}. Egy rendelésben csak
              egy étteremből rendelhetsz. Kiüríted a kosarat, és hozzáadod ezt a tételt?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setPendingAdd(null)}
              >
                <Text style={styles.modalSecondaryText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={confirmReplaceCart}>
                <Text style={styles.modalPrimaryText}>Kosár ürítése</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalSecondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0ECE1',
  },
  modalSecondaryText: {
    color: '#444444',
    fontWeight: '600',
  },
  modalPrimaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FF5722',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});