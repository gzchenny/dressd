import { Image } from "expo-image";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { formatPrice } from "@/utils/money";

interface ProductCardProps {
  id: string;
  imageUrl?: string;
  brand: string;
  name: string;
  priceFrom: number;
  withMembershipFrom?: number | null;
  originalRetail?: number;
  liked: boolean;
  onPress: (id: string) => void;
  onToggleLike: (id: string, liked: boolean) => void;
  style?: any;
}

export function ProductCard({
  id,
  imageUrl,
  brand,
  name,
  priceFrom,
  withMembershipFrom,
  originalRetail,
  liked,
  onPress,
  onToggleLike,
  style,
}: ProductCardProps) {
  const accessibilityLabel = `${brand} ${name}. Rent from ${formatPrice(priceFrom)}${
    withMembershipFrom === 0 ? ". With membership zero" : ""
  }${originalRetail ? `. Original retail ${formatPrice(originalRetail)}` : ""}`;

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress(id)}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {brand.charAt(0)}{name.charAt(0)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => onToggleLike(id, !liked)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol
            name={liked ? "heart.fill" : "heart"}
            size={20}
            color={liked ? "#FF3B30" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        
        <View style={styles.pricing}>
          <Text style={styles.rentPrice}>
            Rent from {formatPrice(priceFrom)}
          </Text>
          {withMembershipFrom === 0 && (
            <Text style={styles.membershipPrice}>
              With membership $0
            </Text>
          )}
          {originalRetail && (
            <Text style={styles.originalRetail}>
              Original Retail {formatPrice(originalRetail)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      // Remove borderRadius to make complete rectangles
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
      aspectRatio: 3/4,
    },
    image: {
      width: '100%',
      height: '100%',
      // Remove borderRadius to make complete rectangles
    },
    placeholderImage: {
      backgroundColor: '#eee',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#999',
    },
    heartButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 44,
      height: 44,
      borderRadius: 22, // Keep heart button rounded
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 8, // Reduced padding for tighter layout
    },
    brand: {
      fontSize: 12,
      fontWeight: '600',
      color: '#111',
      marginBottom: 2,
    },
    name: {
      fontSize: 12,
      color: '#111',
      lineHeight: 16,
      marginBottom: 6, // Reduced margin
    },
    pricing: {
      gap: 1, // Reduced gap between price lines
    },
    rentPrice: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111',
    },
    membershipPrice: {
      fontSize: 11,
      color: '#28a745',
      fontWeight: '500',
    },
    originalRetail: {
      fontSize: 10,
      color: '#555',
    },
  });