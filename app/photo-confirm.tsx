import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PhotoConfirmScreen() {
  const { photoUri, photoBase64 } = useLocalSearchParams<{
    photoUri: string;
    photoBase64: string;
  }>();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRetake = () => {
    router.back();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // TODO: Here we'll call the OpenAI QA agent first, then the sommelier agent
      // For now, simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to wine list with mock data
      router.push('/wine-list');
    } catch (error) {
      console.error('Error analyzing photo:', error);
      // TODO: Show error message
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Photo preview */}
      <Image 
        source={{ uri: photoUri }} 
        style={styles.photo}
        resizeMode="cover"
      />
      
      {/* Overlay controls */}
      <View style={styles.overlay}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.closeButton} onPress={handleRetake}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.retakeButton]} 
              onPress={handleRetake}
              disabled={isAnalyzing}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.analyzeButton]} 
              onPress={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Ionicons 
                name={isAnalyzing ? "hourglass" : "wine"} 
                size={24} 
                color="#000" 
              />
              <Text style={[styles.buttonText, styles.analyzeButtonText]}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Menu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  photo: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  analyzeButton: {
    backgroundColor: '#ffd33d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  analyzeButtonText: {
    color: '#000',
  },
}); 