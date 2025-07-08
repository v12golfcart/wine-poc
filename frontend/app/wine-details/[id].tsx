import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data - this will be replaced with actual data from Supabase
const getWineById = (id: string) => {
  const wines = [
    {
      id: '1',
      name: 'Château Pichon Baron 2016',
      varietal: 'Cabernet Sauvignon, Bordeaux Red Blend',
      year: '2016',
      price: '$89',
      region: 'Pauillac, Bordeaux, France',
      alcohol: '13.5%',
      notes: 'Rich and powerful with exceptional structure. Matches your preference for full-bodied reds perfectly.',
      description: 'This exceptional Bordeaux blend showcases the mastery of Château Pichon Baron. With its deep ruby color and complex aromatics, it presents layers of dark berries, cedar, and subtle spice. The palate is full-bodied yet elegant, with firm tannins that promise excellent aging potential.',
      tastingNotes: [
        'Dark berries and blackcurrant',
        'Cedar and tobacco',
        'Hints of vanilla and spice',
        'Long, elegant finish'
      ],
      pairingRecommendations: [
        'Grilled ribeye steak',
        'Roasted lamb with herbs',
        'Aged hard cheeses',
        'Dark chocolate desserts'
      ],
      isRecommended: true,
      rank: 1,
    },
    {
      id: '2',
      name: 'Opus One 2018',
      varietal: 'Cabernet Sauvignon, Merlot Blend',
      year: '2018',
      price: '$125',
      region: 'Napa Valley, California',
      alcohol: '14.5%',
      notes: 'Bold Napa blend with cassis and vanilla. Slightly above your budget but worth it.',
      description: 'A prestigious collaboration between Robert Mondavi and Baron Philippe de Rothschild, Opus One represents the pinnacle of Napa Valley winemaking. This vintage showcases perfect harmony between power and finesse.',
      tastingNotes: [
        'Cassis and dark cherry',
        'Vanilla and oak',
        'Graphite minerality',
        'Silky, persistent finish'
      ],
      pairingRecommendations: [
        'Prime rib roast',
        'Venison medallions',
        'Truffle risotto',
        'Bittersweet chocolate'
      ],
      isRecommended: true,
      rank: 2,
    },
  ];
  
  return wines.find(wine => wine.id === id) || wines[0];
};

export default function WineDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wine = getWineById(id);

  const handleConfirmSelection = () => {
    Alert.alert(
      'Confirm Selection',
      `Add "${wine.name}" to your wine journey?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // TODO: Add to Supabase
            // For now, navigate to activity tab
            router.navigate('/(tabs)/activity');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.varietal}>{wine.varietal}</Text>
          <View style={styles.priceYearContainer}>
            <Text style={styles.year}>{wine.year}</Text>
            <Text style={styles.price}>{wine.price}</Text>
          </View>
        </View>
        <Text style={styles.wineName}>{wine.name}</Text>
        <Text style={styles.region}>{wine.region}</Text>
        
        {wine.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={16} color="#000" />
            <Text style={styles.badgeText}>AI RECOMMENDATION #{wine.rank}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sommelier Notes</Text>
        <Text style={styles.notes}>{wine.notes}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{wine.description}</Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Alcohol</Text>
          <Text style={styles.detailValue}>{wine.alcohol}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Region</Text>
          <Text style={styles.detailValue}>{wine.region}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasting Notes</Text>
        {wine.tastingNotes.map((note, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pairing Recommendations</Text>
        {wine.pairingRecommendations.map((pairing, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{pairing}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSelection}>
        <Ionicons name="checkmark-circle" size={24} color="#000" />
        <Text style={styles.confirmButtonText}>Select This Wine</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  varietal: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '500',
    flex: 1,
  },
  priceYearContainer: {
    alignItems: 'flex-end',
  },
  year: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  wineName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  region: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd33d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  notes: {
    fontSize: 16,
    color: '#ffd33d',
    lineHeight: 24,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 20,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#ffd33d',
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    flex: 1,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffd33d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
}); 