import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Mock data - this will be replaced with Supabase data later
const mockWines = [
  {
    id: '1',
    name: 'Château Margaux 2015',
    varietal: 'Cabernet Sauvignon, Bordeaux Red Blend',
    year: '2015',
    notes: 'Elegant and refined, with notes of dark berries and cedar. Perfect for special occasions.',
    selectedAt: '2024-01-15',
  },
  {
    id: '2', 
    name: 'Opus One 2018',
    varietal: 'Cabernet Sauvignon, Merlot Blend',
    year: '2018',
    notes: 'Bold and structured with cassis and vanilla notes. A wine for the adventurous palate.',
    selectedAt: '2024-01-10',
  },
];

export default function ActivityScreen() {
  const router = useRouter();

  const renderWineItem = ({ item }: { item: typeof mockWines[0] }) => (
    <TouchableOpacity 
      style={styles.wineCard}
      onPress={() => router.push(`/wine-details/${item.id}`)}
    >
      <View style={styles.wineHeader}>
        <Text style={styles.varietal}>{item.varietal}</Text>
        <Text style={styles.year}>{item.year}</Text>
      </View>
      <Text style={styles.wineName}>{item.name}</Text>
      <Text style={styles.notes}>{item.notes}</Text>
      <Text style={styles.date}>Selected {new Date(item.selectedAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Wine Journey</Text>
        <Text style={styles.subtitle}>Wines you've discovered</Text>
      </View>
      
      {mockWines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No wines yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by scanning a wine menu with the Sommelier camera
          </Text>
        </View>
      ) : (
        <FlatList
          data={mockWines}
          renderItem={renderWineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    color: '#888',
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
  wineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  varietal: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '500',
    flex: 1,
  },
  year: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '500',
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
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 