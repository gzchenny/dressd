import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar } from "@/components/AppBar";
import { ThemedText } from "@/components/ThemedText";
import {
  CartItem,
  clearCart,
  getCartItems,
  getCartTotal,
} from "@/services/cartService";
import { formatPrice } from "@/utils/money";

export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    securityDeposits: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const items = await getCartItems();
      const cartTotals = await getCartTotal();

      if (items.length === 0) {
        Alert.alert("Empty Cart", "Your cart is empty", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      setCartItems(items);
      setTotals(cartTotals);
    } catch (error) {
      console.error("Error loading checkout data:", error);
      Alert.alert("Error", "Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!email || !fullName || !phone || !address || !city || !zipCode) {
      Alert.alert(
        "Missing Information",
        "Please fill in all personal information fields"
      );
      return false;
    }

    if (!cardNumber || !expiryDate || !cvv) {
      Alert.alert(
        "Missing Payment Info",
        "Please fill in all payment information fields"
      );
      return false;
    }

    // basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return false;
    }

    // basic card number validation (should be 16 digits)
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      Alert.alert("Invalid Card", "Please enter a valid 16-digit card number");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      // simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // in a real app, you would process payment with stripe/paypal, create rental records, send emails, update availability
      const orderData = {
        items: cartItems,
        customer: { email, fullName, phone, address, city, zipCode },
        totals,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
      };

      console.log("Order placed:", orderData);

      // clear cart after successful order
      await clearCart();

      Alert.alert(
        "Order Confirmed!",
        `Your rental order has been placed successfully.\n\nOrder ID: ${orderData.orderId}\n\nYou'll receive a confirmation email shortly.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)/home");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert(
        "Order Failed",
        "There was an error processing your order. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <AppBar title="Checkout" showWishlist={false} showCart={false} />
        <View style={styles.loadingContainer}>
          <Text>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppBar title="Checkout" showWishlist={false} showCart={false} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Order Summary ({cartItems.length} item
            {cartItems.length !== 1 ? "s" : ""})
          </ThemedText>

          {cartItems.map((item, index) => (
            <View key={`${item.itemId}-${index}`} style={styles.orderItem}>
              <Text style={styles.orderItemTitle}>{item.title}</Text>
              <Text style={styles.orderItemDetails}>
                {item.startDate} to {item.endDate} ({item.totalDays} days)
              </Text>
              <Text style={styles.orderItemPrice}>
                {formatPrice(item.totalPrice)} +{" "}
                {formatPrice(item.securityDeposit)} deposit
              </Text>
            </View>
          ))}

          <View style={styles.orderTotals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Rental Total:</Text>
              <Text style={styles.totalValue}>
                {formatPrice(totals.subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Security Deposits:</Text>
              <Text style={styles.totalValue}>
                {formatPrice(totals.securityDeposits)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>
                {formatPrice(totals.total)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Personal Information
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.cityInput]}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />

            <TextInput
              style={[styles.input, styles.zipInput]}
              placeholder="ZIP Code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Payment Information
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Card Number (1234 5678 9012 3456)"
            value={cardNumber}
            onChangeText={(text) => {
              // format card number with spaces
              const formatted = text
                .replace(/\s/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim();
              setCardNumber(formatted);
            }}
            keyboardType="numeric"
            maxLength={19}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.expiryInput]}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={(text) => {
                // format expiry date
                const formatted = text
                  .replace(/\D/g, "")
                  .replace(/(\d{2})(\d)/, "$1/$2");
                setExpiryDate(formatted);
              }}
              keyboardType="numeric"
              maxLength={5}
            />

            <TextInput
              style={[styles.input, styles.cvvInput]}
              placeholder="CVV"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            Security deposits will be refunded after the rental period ends and
            items are returned in good condition.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            processing && styles.processingButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={processing}
        >
          <Text style={styles.placeOrderButtonText}>
            {processing
              ? "Processing..."
              : `Place Order - ${formatPrice(totals.total)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111",
  },
  orderItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  orderItemDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#653A79",
  },
  orderTotals: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#653A79",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  cityInput: {
    flex: 2,
  },
  zipInput: {
    flex: 1,
  },
  expiryInput: {
    flex: 1,
  },
  cvvInput: {
    flex: 1,
  },
  disclaimerSection: {
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  disclaimerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  placeOrderButton: {
    backgroundColor: "#653A79",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  processingButton: {
    backgroundColor: "#999",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
