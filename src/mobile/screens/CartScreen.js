import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { fetchWithAuth } from '../services/api';

const DEFAULT_DELIVERY_FEE = 790;

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

export default function CartScreen({
  cartItems = [],
  restaurantId,
  deliveryFee: deliveryFeeProp = DEFAULT_DELIVERY_FEE,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBack,
  onOrderSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const deliveryFee = cartItems.length > 0 ? roundMoney(deliveryFeeProp) : 0;
  const itemsTotal = roundMoney(
    cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  );
  const grandTotal = roundMoney(itemsTotal + deliveryFee);

  const handleCheckout = async () => {
    if (cartItems.length === 0 || loading) return;

    if (!restaurantId) {
      setErrorMessage('Nem sikerült azonosítani az éttermet. Térj vissza az étlaphoz, és próbáld újra.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Add meg a szállítási címedet a rendelés leadásához.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        restaurant_id: restaurantId,
        delivery_address: deliveryAddress.trim(),
        delivery_fee: deliveryFee,
        total_price: grandTotal,
        total_calories: cartItems.reduce(
          (sum, item) => sum + Number(item.calories || 0) * item.quantity,
          0
        ),
        items: cartItems.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      onClearCart?.();
      setOrderPlaced(true);
    } catch (error) {
      console.error('Rendelési hiba:', error);
      setErrorMessage('A rendelést nem sikerült leadni. Ellenőrizd a kapcsolatot, és próbáld újra.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderDone = () => {
    setOrderPlaced(false);
    if (onOrderSuccess) {
      onOrderSuccess();
    } else {
      onBack?.();
    }
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      onUpdateQuantity?.(item.id, -1);
    } else {
      onRemoveItem?.(item.id);
    }
  };

  if (orderPlaced) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍕</Text>
          <Text style={styles.emptyTitle}>Sikeres rendelés!</Text>
          <Text style={styles.emptySubtitle}>
            A rendelésedet rögzítettük és átadtuk az étteremnek.
          </Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={handleOrderDone}>
            <Text style={styles.exploreBtnText}>Rendben</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Vissza</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kosár</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>A kosarad még üres</Text>
          <Text style={styles.emptySubtitle}>
            Nézz körül az éttermek kínálatában és válassz valami finomat!
          </Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={onBack}>
            <Text style={styles.exploreBtnText}>Éttermek böngészése</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kosár ({cartItems.length})</Text>
        <TouchableOpacity onPress={onClearCart}>
          <Text style={styles.clearText}>Törlés</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kiválasztott ételek</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnitPrice}>{roundMoney(item.price)} lej / db</Text>
              </View>

              <View style={styles.controlsRow}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrease(item)}>
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onUpdateQuantity?.(item.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTotalPrice}>
                  {roundMoney(Number(item.price) * item.quantity)} lej
                </Text>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => onRemoveItem?.(item.id)}
                >
                  <Text style={styles.removeBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Összegzés</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ételek összesen</Text>
            <Text style={styles.summaryValue}>{itemsTotal} lej</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Szállítási díj</Text>
            <Text style={styles.summaryValue}>{deliveryFee} lej</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Végösszeg</Text>
            <Text style={styles.totalValue}>{grandTotal} lej</Text>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.summaryTitle}>Szállítási cím</Text>
          <TextInput
            style={styles.addressInput}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Utca, házszám, város"
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.checkoutBtnText}>
              Rendelés leadása • {grandTotal} lej
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
  },
  headerSpacer: {
    width: 60,
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  clearText: {
    fontSize: 13,
    color: '#FF5722',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEBE4',
  },
  itemInfo: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  removeBtn: {
    padding: 6,
  },
  removeBtnText: {
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 30,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 24,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#EFEBE4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEBE4',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEBE4',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  checkoutBtn: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  checkoutBtnDisabled: {
    opacity: 0.7,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});