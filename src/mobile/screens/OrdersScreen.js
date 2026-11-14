import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { fetchWithAuth } from '../services/api';

const ORDER_STATUSES = {
  pending: { label: 'Feldolgozás alatt ⏳', step: 1 },
  accepted: { label: 'Feldolgozás alatt ⏳', step: 1 },
  in_preparation: { label: 'Készítés alatt 🍳', step: 2 },
  ready: { label: 'Készítés alatt 🍳', step: 2 },
  on_the_way: { label: 'Futárnál 🛵', step: 3 },
  delivered: { label: 'Kiszállítva 🍕', step: 4 },
  cancelled: { label: 'Törölve ❌', step: 0 },
};

const normalizeOrder = (order) => {
  const statuses = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    PREPARING: 'in_preparation',
    READY: 'ready',
    DELIVERING: 'on_the_way',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  const restaurant = Array.isArray(order.restaurants)
    ? order.restaurants[0]
    : order.restaurants;

  return {
    id: order.id,
    restaurantName: restaurant?.name || 'Étterem',
    status: statuses[order.status] || String(order.status).toLowerCase(),
    createdAt: order.created_at
      ? new Date(order.created_at).toLocaleString('hu-HU')
      : '',
    totalAmount: order.total_price,
    items: (order.order_items || []).map((orderItem) => {
      const menuItem = Array.isArray(orderItem.menu_items)
        ? orderItem.menu_items[0]
        : orderItem.menu_items;

      return {
        id: orderItem.id,
        name: menuItem?.name || 'Törölt étel',
        quantity: orderItem.quantity,
        price: orderItem.price_at_time,
      };
    }),
  };
};

export default function OrdersScreen({ onBack, onSelectRestaurant }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchWithAuth('/orders');
      if (!Array.isArray(data)) {
        throw new Error('A szerver érvénytelen rendeléslistát küldött.');
      }
      setOrders(data.map(normalizeOrder));
      setErrorMessage('');
    } catch (error) {
      console.error('Rendelések betöltési hiba:', error);
      setErrorMessage(error.message || 'Nem sikerült betölteni a rendeléseket.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Rendelések betöltése...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rendeléseim</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />
        }
      >
        {errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage} Húzd le a listát az újrapróbálkozáshoz.
          </Text>
        ) : null}

        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Folyamatban lévő rendelés</Text>
            {activeOrders.map((order) => {
              const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              const currentStep = statusInfo.step;

              return (
                <View key={order.id} style={styles.activeCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.restaurantName}>{order.restaurantName || 'Étterem'}</Text>
                    <Text style={styles.orderDate}>{order.createdAt}</Text>
                  </View>

                  <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>

                  <View style={styles.progressContainer}>
                    {[1, 2, 3, 4].map((step) => {
                      const isCompleted = step <= currentStep;
                      return (
                        <View key={step} style={styles.stepWrapper}>
                          <View
                            style={[
                              styles.stepDot,
                              isCompleted && styles.stepDotActive,
                            ]}
                          >
                            <Text style={[styles.stepDotText, isCompleted && styles.stepDotTextActive]}>
                              {step}
                            </Text>
                          </View>
                          {step < 4 && (
                            <View
                              style={[
                                styles.stepLine,
                                step < currentStep && styles.stepLineActive,
                              ]}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.stepLabelsRow}>
                    <Text style={styles.stepSubLabel}>Elküldve</Text>
                    <Text style={styles.stepSubLabel}>Készül</Text>
                    <Text style={styles.stepSubLabel}>Futárnál</Text>
                    <Text style={styles.stepSubLabel}>Megérkezett</Text>
                  </View>

                  <View style={styles.itemsDivider} />
                  {order.items?.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price * item.quantity} lej</Text>
                    </View>
                  ))}

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Végösszeg:</Text>
                    <Text style={styles.totalAmount}>{order.totalAmount} lej</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Korábbi rendelések</Text>

          {pastOrders.length === 0 && activeOrders.length === 0 && !errorMessage ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyTitle}>Még nem adtál le rendelést</Text>
              <Text style={styles.emptySubtitle}>A korábbi rendeléseidet itt fogod megtalálni.</Text>
            </View>
          ) : (
            pastOrders.map((order) => (
              <View key={order.id} style={styles.pastCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.pastRestaurantName}>{order.restaurantName || 'Étterem'}</Text>
                  <Text style={styles.pastStatus}>
                    {order.status === 'delivered' ? '✓ Kiszállítva' : '× Törölve'}
                  </Text>
                </View>

                <Text style={styles.pastDate}>{order.createdAt}</Text>

                <View style={styles.itemsDivider} />

                {order.items?.map((item, idx) => (
                  <Text key={idx} style={styles.pastItemText}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}

                <View style={styles.pastFooter}>
                  <Text style={styles.pastTotal}>{order.totalAmount} lej</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
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
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF5722',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  orderDate: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFEBE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#FF5722',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#EFEBE4',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#FF5722',
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  stepSubLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  itemsDivider: {
    height: 1,
    backgroundColor: '#F0ECE1',
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF5722',
    marginRight: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  pastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 10,
  },
  pastRestaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  pastStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  pastDate: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  pastItemText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  pastTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
  },
});