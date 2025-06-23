import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock AI analysis results - this will be replaced with actual OpenAI responses
const mockWines = [
  {
    id: '1',
    name: 'Château Pichon Baron 2016',
    varietal: 'Cabernet Sauvignon, Bordeaux Red Blend',
    year: '2016',
    price: '$89',
    notes: '🏆 TOP PICK: Rich and powerful with exceptional structure. Matches your preference for full-bodied reds perfectly.',
    isRecommended: true,
    rank: 1,
  },
  {
    id: '2',
    name: 'Opus One 2018',
    varietal: 'Cabernet Sauvignon, Merlot Blend', 
    year: '2018',
    price: '$125',
    notes: '🥈 EXCELLENT CHOICE: Bold Napa blend with cassis and vanilla. Slightly above your budget but worth it.',
    isRecommended: true,
    rank: 2,
  },
  {
    id: '3',
    name: 'Caymus Cabernet Sauvignon 2020',
    varietal: 'Cabernet Sauvignon',
    year: '2020', 
    price: '$65',
    notes: '🥉 GREAT VALUE: Smooth Napa Cab with dark fruit flavors. Perfect balance of quality and price.',
    isRecommended: true,
    rank: 3,
  },
  {
    id: '4',
    name: 'Kendall-Jackson Vintner\'s Reserve Chardonnay 2021',
    varietal: 'Chardonnay',
    year: '2021',
    price: '$25',
    notes: 'Crisp white with oak and vanilla notes. Not your usual style but well-made.',
    isRecommended: false,
  },
  {
    id: '5',
    name: 'Dom Pérignon 2013',
    varietal: 'Champagne',
    year: '2013',
    price: '$200',
    notes: 'Prestigious champagne with fine bubbles. Premium option for celebrations.',
    isRecommended: false,
  },
];

export default function WineListScreen() {
  const router = useRouter();

  const handleSelectWine = (wine: typeof mockWines[0]) => {
    router.push(`/wine-details/${wine.id}`);
  };

  const renderWineItem = ({ item }: { item: typeof mockWines[0] }) => (
    <TouchableOpacity 
      style={[
        styles.wineCard,
        item.isRecommended && styles.recommendedCard
      ]}
      onPress={() => handleSelectWine(item)}
    >
      {item.isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.badgeText}>AI RECOMMENDATION #{item.rank}</Text>
        </View>
      )}
      
      <View style={styles.wineHeader}>
        <Text style={styles.varietal}>{item.varietal}</Text>
        <View style={styles.priceYearContainer}>
          <Text style={styles.year}>{item.year}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
      
      <Text style={styles.wineName}>{item.name}</Text>
      <Text style={styles.notes}>{item.notes}</Text>
      
      <View style={styles.selectButton}>
        <Text style={styles.selectButtonText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color="#ffd33d" />
      </View>
    </TouchableOpacity>
  );

  const recommendedWines = mockWines.filter(wine => wine.isRecommended);
  const otherWines = mockWines.filter(wine => !wine.isRecommended);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wine Menu Analysis</Text>
        <Text style={styles.subtitle}>AI Sommelier Recommendations</Text>
      </View>

      <FlatList
        data={[...recommendedWines, ...otherWines]}
        renderItem={renderWineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Personalized for You</Text>
            <Text style={styles.sectionSubtitle}>
              Based on your preference for full-bodied reds, $30-60 budget
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffd33d',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  wineCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  recommendedCard: {
    borderColor: '#ffd33d',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#ffd33d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  wineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },
  varietal: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '500',
    flex: 1,
  },
  priceYearContainer: {
    alignItems: 'flex-end',
  },
  year: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  wineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
  },
}); 