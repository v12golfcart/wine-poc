import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SommelierScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        // Navigate to photo confirmation screen with the photo data
        router.push({
          pathname: '/photo-confirm',
          params: { 
            photoUri: photo.uri,
            photoBase64: photo.base64 
          }
        });
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        <View style={styles.overlay}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <View style={styles.captureContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
}); 