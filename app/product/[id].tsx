import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Calendar, DateData } from 'react-native-calendars';

import { AppBar } from '@/components/AppBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getItemById, ItemData } from '@/services/itemService';
import { addToWishlist, removeFromWishlist, isItemLiked } from '@/services/wishlistService';
import { addToCart, CartItem } from '@/services/cartService';

const { width } = Dimensions.get('window');

interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    dotColor?: string;
    customStyles?: any;
  };
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    loadProduct();
    generateAvailableDates();
  }, [id]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedStartDate, selectedEndDate, item]);

  const loadProduct = async () => {
    if (!id || typeof id !== 'string') {
      router.back();
      return;
    }

    try {
      const product = await getItemById(id);
      if (product) {
        setItem(product);
        const isLiked = await isItemLiked(id);
        setLiked(isLiked);
      } else {
        Alert.alert('Error', 'Product not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = () => {
    const today = new Date();
    const unavailableDates = [
      // Simulate some unavailable dates (e.g., already booked)
      '2024-12-25', '2024-12-26', '2024-12-31', '2025-01-01',
      '2025-01-15', '2025-01-16', '2025-02-14'
    ];

    const marked: MarkedDates = {};

    // Mark past dates as disabled
    for (let i = -30; i < 0; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      marked[dateString] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: {
            backgroundColor: '#f0f0f0',
          },
          text: {
            color: '#ccc',
          },
        },
      };
    }

    // Mark unavailable dates
    unavailableDates.forEach(date => {
      marked[date] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: {
            backgroundColor: '#ffebee',
          },
          text: {
            color: '#f44336',
            textDecorationLine: 'line-through',
          },
        },
      };
    });

    setMarkedDates(marked);
  };

  const calculateTotalPrice = () => {
    if (!selectedStartDate || !selectedEndDate || !item?.rentPrice) {
      setTotalPrice(0);
      return;
    }

    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end date

    setTotalPrice(diffDays * item.rentPrice);
  };

  const onDayPress = (day: DateData) => {
    const { dateString } = day;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Select start date
      setSelectedStartDate(dateString);
      setSelectedEndDate('');
      setMarkedDates(prev => ({
        ...prev,
        [dateString]: {
          ...prev[dateString],
          selected: true,
          selectedColor: '#653A79',
        },
      }));
    } else if (selectedStartDate && !selectedEndDate) {
      // Select end date
      if (dateString <= selectedStartDate) {
        Alert.alert('Invalid Selection', 'End date must be after start date');
        return;
      }

      setSelectedEndDate(dateString);
      
      // Mark date range
      const start = new Date(selectedStartDate);
      const end = new Date(dateString);
      const newMarked: MarkedDates = { ...markedDates };

      // Clear previous selections first
      Object.keys(newMarked).forEach(date => {
        if (newMarked[date].selected) {
          delete newMarked[date].selected;
          delete newMarked[date].selectedColor;
        }
      });

      // Mark the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = d.toISOString().split('T')[0];
        newMarked[currentDate] = {
          ...newMarked[currentDate],
          selected: true,
          selectedColor: '#653A79',
        };
      }

      setMarkedDates(newMarked);
    }
  };

  const handleToggleLike = async () => {
    if (!item?.id) return;

    try {
      if (liked) {
        await removeFromWishlist(item.id);
        setLiked(false);
      } else {
        await addToWishlist(item.id);
        setLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleRentNow = async () => {
    if (!item) return;
    
    if (!selectedStartDate || !selectedEndDate) {
      Alert.alert('Select Dates', 'Please select your rental dates first');
      return;
    }
  
    const days = Math.ceil((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
    try {
      const cartItem: CartItem = {
        itemId: item.id || '',
        title: item.title,
        imageUrl: item.imageUrl,
        ownerUsername: item.ownerUsername || 'Unknown',
        rentPrice: item.rentPrice,
        securityDeposit: item.securityDeposit || 0,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        totalDays: days,
        totalPrice: totalPrice,
        addedAt: new Date().toISOString(),
      };
  
      await addToCart(cartItem);
  
      Alert.alert(
        'Added to Cart!',
        `"${item.title}" has been added to your cart for ${selectedStartDate} to ${selectedEndDate}`,
        [
          { text: 'Continue Shopping', onPress: () => router.back() },
          { text: 'View Cart', onPress: () => router.push('/(tabs)/cart' as any) }
        ]
      );
  
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };
  
  const clearSelection = () => {
    setSelectedStartDate('');
    setSelectedEndDate('');
    generateAvailableDates(); // Reset to original marked dates
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AppBar title="Product Details"   showWishlist={false} showCart={false} />
        <View style={styles.loadingContainer}>
          <Text>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AppBar title="Product Details" showWishlist={false} showCart={false}  />
        <View style={styles.errorContainer}>
          <Text>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppBar title="Product Details" showWishlist={false} showCart={false}  />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
              contentFit="cover"
              placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          
          {/* Heart Button */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleToggleLike}
          >
            <IconSymbol
              name={liked ? "heart.fill" : "heart"}
              size={28}
              color={liked ? "#FF3B30" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.brand}>{item.ownerUsername || 'Designer'}</Text>
            <Text style={styles.title}>{item.title}</Text>
            
            <View style={styles.priceSection}>
              <Text style={styles.rentPrice}>
                ${item.rentPrice} / day
              </Text>
              {item.securityDeposit && (
                <Text style={styles.securityDeposit}>
                  Security deposit: ${item.securityDeposit}
                </Text>
              )}
            </View>
          </View>

          {/* Calendar Section */}
          <View style={styles.section}>
            <View style={styles.calendarHeader}>
              <Text style={styles.sectionTitle}>Select Rental Dates</Text>
              {(selectedStartDate || selectedEndDate) && (
                <TouchableOpacity onPress={clearSelection}>
                  <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {selectedStartDate && (
              <View style={styles.dateSelection}>
                <Text style={styles.dateText}>
                  {selectedEndDate 
                    ? `${selectedStartDate} to ${selectedEndDate}` 
                    : `Start: ${selectedStartDate} (select end date)`
                  }
                </Text>
                {totalPrice > 0 && (
                  <Text style={styles.totalPrice}>Total: ${totalPrice}</Text>
                )}
              </View>
            )}

            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType="custom"
              theme={{
                selectedDayBackgroundColor: '#653A79',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#653A79',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                arrowColor: '#653A79',
                monthTextColor: '#653A79',
                indicatorColor: '#653A79',
                textDayFontWeight: '600',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              minDate={new Date().toISOString().split('T')[0]}
              maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 90 days from now
            />
            
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
                <Text style={styles.legendText}>Unavailable</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#653A79' }]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>@{item.ownerUsername}</Text>
                <Text style={styles.ownerStats}>5.0 ★ • 24 reviews</Text>
              </View>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Alert.alert('Coming Soon', 'Messaging will be implemented here')}
              >
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          {totalPrice > 0 ? (
            <>
              <Text style={styles.bottomPrice}>Total: ${totalPrice}</Text>
              <Text style={styles.bottomSubtext}>
                {Math.ceil((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.bottomPrice}>${item.rentPrice}/day</Text>
              <Text style={styles.bottomSubtext}>Plus security deposit</Text>
            </>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.rentButton, 
            (!selectedStartDate || !selectedEndDate) && styles.rentButtonDisabled
          ]} 
          onPress={handleRentNow}
          disabled={!selectedStartDate || !selectedEndDate}
        >
          <Text style={styles.rentButtonText}>
            {(!selectedStartDate || !selectedEndDate) ? 'Select Dates' : 'Rent Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: width * 1.2,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#653A79',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
    lineHeight: 32,
  },
  priceSection: {
    gap: 4,
  },
  rentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  securityDeposit: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  clearButton: {
    fontSize: 16,
    color: '#653A79',
    fontWeight: '600',
  },
  dateSelection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#653A79',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  ownerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  ownerStats: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    backgroundColor: '#653A79',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  priceInfo: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  bottomSubtext: {
    fontSize: 12,
    color: '#666',
  },
  rentButton: {
    backgroundColor: '#653A79',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 16,
  },
  rentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});