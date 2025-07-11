import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WineRecommendation {
  wineries: string[];
  name: string;
  year: string | null;
  varietal: string;
  region: string | null;
  recommendation: {
    rating: number;
    match_score: number;
    tasting_notes: string;
    food_pairing: string;
    why_recommended: string;
    price_estimate: string | null;
  };
}

const STORAGE_KEY = 'wine_recommendations';

export default function RecommendationsScreen() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<WineRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return '#4CAF50'; // Green
    if (rating >= 70) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const handleBack = () => {
    // Go back to camera
    router.push('/(tabs)/');
  };

  const renderRecommendationItem = ({ item }: { item: WineRecommendation }) => (
    <View style={styles.wineCard}>
      {/* Header with winery and vintage */}
      <View style={styles.wineHeader}>
        <View style={styles.wineryContainer}>
          <Text style={styles.winery}>{item.wineries.join(' & ')}</Text>
          {item.year && <Text style={styles.year}>{item.year}</Text>}
        </View>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Match</Text>
            <Text style={[styles.scoreValue, { color: getMatchScoreColor(item.recommendation.match_score) }]}>
              {item.recommendation.match_score}%
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Rating</Text>
            <Text style={[styles.scoreValue, { color: getRatingColor(item.recommendation.rating) }]}>
              {item.recommendation.rating}
            </Text>
          </View>
        </View>
      </View>

      {/* Wine name and varietal */}
      <Text style={styles.wineName}>{item.name}</Text>
      <View style={styles.varietalRegionContainer}>
        <Text style={styles.varietal}>{item.varietal}</Text>
        {item.region && <Text style={styles.region}> • {item.region}</Text>}
      </View>

      {/* Why recommended */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={16} color="#ffd33d" />
          <Text style={styles.sectionTitle}>Why Recommended</Text>
        </View>
        <Text style={styles.sectionText}>{item.recommendation.why_recommended}</Text>
      </View>

      {/* Tasting notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="wine" size={16} color="#ffd33d" />
          <Text style={styles.sectionTitle}>Tasting Notes</Text>
        </View>
        <Text style={styles.sectionText}>{item.recommendation.tasting_notes}</Text>
      </View>

      {/* Food pairing */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={16} color="#ffd33d" />
          <Text style={styles.sectionTitle}>Food Pairing</Text>
        </View>
        <Text style={styles.sectionText}>{item.recommendation.food_pairing}</Text>
      </View>

      {/* Price estimate */}
      {item.recommendation.price_estimate && (
        <View style={styles.priceContainer}>
          <Ionicons name="pricetag" size={16} color="#888" />
          <Text style={styles.priceText}>{item.recommendation.price_estimate}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modal-style header with back button */}
      <View style={styles.modalHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Sommelier Recommendations</Text>
          <Text style={styles.subtitle}>{recommendations.length} personalized suggestions</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // Account for status bar
    backgroundColor: '#25292e',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerSpacer: {
    width: 40, // Balance the back button
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  wineCard: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  wineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wineryContainer: {
    flex: 1,
  },
  winery: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
  },
  year: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  scoresContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  varietalRegionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  varietal: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
  },
  region: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffd33d',
    textTransform: 'uppercase',
  },
  sectionText: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  priceText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
}); 