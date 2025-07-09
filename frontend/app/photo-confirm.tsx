import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl } from '../config/api';

const { width, height } = Dimensions.get('window');

export default function PhotoConfirmScreen() {
  const { photoUri } = useLocalSearchParams<{
    photoUri: string;
    // Removed photoBase64 parameter
  }>();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'analyzing'>('idle');
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRetake = () => {
    router.back();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setUploadProgress('uploading');
    setError(null);
    
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
      
      setUploadProgress('analyzing');
      
      const uploadResponse = await fetch(getApiUrl('/analyze-image-file'), {
        method: 'POST',
        body: formData,
      });
      
      const result = await uploadResponse.json();
      
      if (result.success) {
        setAiDescription(result.description);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (error) {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress('idle');
    }
  };

  const getLoadingMessage = () => {
    switch (uploadProgress) {
      case 'uploading':
        return 'Uploading image...';
      case 'analyzing':
        return 'AI analyzing image...';
      default:
        return 'Processing...';
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

        {/* AI Description Result */}
        {(aiDescription || error) && (
          <View style={styles.resultContainer}>
            <ScrollView style={styles.resultScrollView} contentContainerStyle={styles.resultContent}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={error ? "alert-circle" : "checkmark-circle"} 
                  size={24} 
                  color={error ? "#ff6b6b" : "#ffd33d"} 
                />
                <Text style={styles.resultTitle}>
                  {error ? "Analysis Failed" : "AI Description"}
                </Text>
              </View>
              
              <Text style={[styles.resultText, error && styles.errorText]}>
                {error || aiDescription}
              </Text>
            </ScrollView>
          </View>
        )}

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

            {!aiDescription && !error ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.analyzeButton]} 
                onPress={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Ionicons 
                  name={isAnalyzing ? "hourglass" : "eye"} 
                  size={24} 
                  color="#000" 
                />
                <Text style={[styles.buttonText, styles.analyzeButtonText]}>
                  {isAnalyzing ? getLoadingMessage() : 'Describe'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.analyzeButton]} 
                onPress={() => {
                  setAiDescription(null);
                  setError(null);
                }}
              >
                <Ionicons name="refresh" size={24} color="#000" />
                <Text style={[styles.buttonText, styles.analyzeButtonText]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            )}
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
    gap: 12,
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
  resultContainer: {
    position: 'absolute',
    top: '20%',
    left: 20,
    right: 20,
    bottom: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  resultScrollView: {
    flex: 1,
  },
  resultContent: {
    paddingBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  errorText: {
    color: '#ff6b6b',
  },
}); 