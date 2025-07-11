import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';

const { width, height } = Dimensions.get('window');

export default function PhotoConfirmScreen() {
  const { photoUri } = useLocalSearchParams<{
    photoUri: string;
  }>();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRetake = () => {
    router.back();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Determine file extension from URI
      let fileExtension = 'jpg';
      if (photoUri.includes('.')) {
        const uriExt = photoUri.split('.').pop()?.toLowerCase();
        if (uriExt && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(uriExt)) {
          fileExtension = uriExt === 'jpeg' ? 'jpg' : uriExt;
        }
      }
      
      const filename = `image.${fileExtension}`;
      
      // Append file URI to FormData (React Native approach)
      formData.append('image', {
        uri: photoUri,
        type: `image/${fileExtension}`,
        name: filename,
      } as any);
      
      const response = await fetch(getApiUrl('/api/analyze-wine-image'), {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.valid) {
        if (result.wines && result.wines.length > 0) {
          // Save recommendations to AsyncStorage
          try {
            await AsyncStorage.setItem('wine_recommendations', JSON.stringify(result.wines));
            
            // Navigate to recommendations page
            router.push('/recommendations');
          } catch (error) {
            console.error('Error saving recommendations:', error);
            // Fallback to alert if storage fails
            Alert.alert(
              'Success! 🍷',
              `Found ${result.wines.length} wine${result.wines.length !== 1 ? 's' : ''} with sommelier recommendations!`,
              [{ text: 'OK' }]
            );
          }
        } else {
          // Valid wine image but no wines detected
          Alert.alert(
            'No Wines Found',
            result.error || 'Valid wine image, but no specific wines could be identified.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Invalid image
        Alert.alert(
          'Invalid Image',
          result.message || result.error || 'Please take a photo of a wine bottle or wine menu.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Failed to analyze image. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
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
        resizeMode="contain"
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
              style={[styles.actionButton, styles.analyzeButton, isAnalyzing && styles.disabledButton]} 
              onPress={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Ionicons 
                name={isAnalyzing ? "hourglass" : "wine"} 
                size={24} 
                color="#000" 
              />
              <Text style={[styles.buttonText, styles.analyzeButtonText]}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Wine'}
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
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
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
  disabledButton: {
    opacity: 0.6,
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