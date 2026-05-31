import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCheckNumberMutation } from 'src/redux/api';

const TakePictureScreen: React.FC = () => {
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [checkNumber, { isLoading: isChecking }] = useCheckNumberMutation();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');

  if (!permission) {
    return (
      <View className="flex-1 bg-[#181c24] justify-center items-center">
        <ActivityIndicator size="large" color="#9B907B" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#181c24] justify-center items-center px-6">
        <Ionicons name="camera-outline" size={64} color="#6D7992" />
        <Text className="text-slate-300 text-lg font-semibold text-center mt-4">
          Для сканування номерів потрібен доступ до камери
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="mt-6 bg-[#9B907B] active:bg-[#867b67] px-6 py-3 rounded-xl shadow-lg"
        >
          <Text className="text-[#181c24] font-bold text-base">Надати доступ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (!cameraRef.current || isChecking) return;

    try {
      const options = { quality: 0.8, base64: false }; // Немного подняли качество
      const photo = await cameraRef.current.takePictureAsync(options);

      if (photo?.uri) {
        const filename = photo.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('image', { uri: photo.uri, name: filename, type } as any);

        const response = await checkNumber(formData).unwrap();
        const recognizedPlate = response?.data.number_info.digits; 

        if (recognizedPlate) {
          router.push({
            pathname: `/assessment/${recognizedPlate}`,
            params: { imageUri: photo.uri }
          });
        } else {
          Alert.alert('Помилка', 'Номер не розпізнано. Спробуйте ще раз.');
        }
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Помилка', error?.data?.detail || 'Не вдалося обробити знімок');
    }
  };

  return (
    <View className="flex-1 bg-[#14171e] justify-between">
      <StatusBar style="light" />

      {/* ВЕРХНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <View 
        style={{ paddingTop: insets.top > 0 ? insets.top + 10 : 20 }}
        className="px-6 pb-4 flex-row justify-between items-center bg-[#14171e]"
      >
        <TouchableOpacity 
          onPress={() => setFlash(p => p === 'off' ? 'on' : 'off')} 
          disabled={isChecking}
          className="w-12 h-12 justify-center items-center rounded-full bg-[#181c24] border border-slate-800 active:opacity-70"
        >
          <MaterialIcons 
            name={flash === 'on' ? 'flash-on' : 'flash-off'} 
            size={22} 
            color={flash === 'on' ? '#EAB308' : '#6D7992'} 
          />
        </TouchableOpacity>

        <Text className="text-slate-400 text-sm font-medium">Режим сканування</Text>

        <TouchableOpacity 
          onPress={() => setFacing(p => p === 'back' ? 'front' : 'back')} 
          disabled={isChecking}
          className="w-12 h-12 justify-center items-center rounded-full bg-[#181c24] border border-slate-800 active:opacity-70"
        >
          <Ionicons name="camera-reverse" size={22} color="#9B907B" />
        </TouchableOpacity>
      </View>

      {/* ЦЕНТРАЛЬНАЯ ОБЛАСТЬ: ЧЕСТНЫЙ КОНТЕЙНЕР 4:3 */}
      <View className="w-full aspect-[4/3] bg-black overflow-hidden relative border-y border-slate-900">
        {isFocused ? (
          <>
            <CameraView 
              facing={facing} 
              flash={flash} 
              style={StyleSheet.absoluteFillObject} // Теперь заполняет ровно 4:3
              ref={cameraRef} 
            />

            {/* Рамка-прицел для номера */}
            <View className="absolute inset-0 justify-center items-center px-6 pointer-events-none">
              <View className="w-full h-24 border-2 border-dashed border-[#9B907B]/80 rounded-2xl justify-center items-center bg-black/30 backdrop-blur-[1px]">
                <Text className="text-slate-200 text-xs font-bold uppercase tracking-widest text-center">
                  Помістіть номер автомобіля сюди
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View className="flex-1 bg-[#181c24] justify-center items-center">
            <ActivityIndicator color="#9B907B" />
          </View>
        )}
      </View>

      {/* НИЖНЯЯ ПАНЕЛЬ С КНОПКОЙ ЗАТВОРА */}
      <View 
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }}
        className="bg-[#14171e] pt-6 flex-row justify-center items-center"
      >
        <TouchableOpacity 
          onPress={handleTakePicture}
          disabled={isChecking}
          className={`w-20 h-20 bg-slate-800 rounded-full p-1 justify-center items-center shadow-2xl border-4 border-[#14171e] ${isChecking ? 'opacity-60' : 'active:scale-95'}`}
        >
          <View className="w-full h-full bg-white rounded-full justify-center items-center">
            {isChecking && <ActivityIndicator size="small" color="#14171e" />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TakePictureScreen;