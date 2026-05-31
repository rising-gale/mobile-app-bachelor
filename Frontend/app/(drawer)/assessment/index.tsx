import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native'; // Фикс перегрева
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { useCheckNumberMutation } from 'src/redux/api';

const TakePictureScreen: React.FC = () => {
  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused(); // Проверяем, виден ли экран сейчас

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
      const options = { quality: 0.7, base64: false };
      const photo = await cameraRef.current.takePictureAsync(options);

      if (photo?.uri) {
        const filename = photo.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('image', { uri: photo.uri, name: filename, type } as any);

        // Отправляем на бэк. Бэк теперь возвращает просто строку (номер автомобиля)
        const response = await checkNumber(formData).unwrap();
        
        // Предполагаем, что бэк вернул { success: true, data: "AA1234BB" }
        const recognizedPlate = response?.data.number_info.digits; 

        if (recognizedPlate) {
          // Переходим на динамический роут проверки, передавая строку номера в URL
          // и локальный путь к фото через query-параметры
          router.replace({
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
    <View className="flex-1 bg-[#181c24]">
      <StatusBar style="light" />
      <Drawer.Screen 
        options={{
          headerShown: true, 
          title: 'Нова перевірка', 
          headerStyle: { backgroundColor: '#1e2430' }, 
          headerTintColor: '#9B907B',
          headerLeft: () => <DrawerToggleButton tintColor='#9B907B' />
        }} 
      />

      <View className="flex-1 overflow-hidden bg-black">
        {/* Рендерим камеру ТОЛЬКО если экран в фокусе. 
            Когда юзер уходит отсюда — камера полностью выключается */}
        {isFocused ? (
          <CameraView facing={facing} flash={flash} style={{ flex: 1 }} ref={cameraRef}>
            <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center bg-black/40 p-2 rounded-2xl backdrop-blur-md">
              <TouchableOpacity 
                onPress={() => setFlash(p => p === 'off' ? 'on' : 'off')} 
                className="w-12 h-12 justify-center items-center rounded-full bg-[#181c24]/60"
              >
                <MaterialIcons name={flash === 'on' ? 'flash-on' : 'flash-off'} size={24} color={flash === 'on' ? '#EAB308' : '#6D7992'} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setFacing(p => p === 'back' ? 'front' : 'back')} 
                className="w-12 h-12 justify-center items-center rounded-full bg-[#181c24]/60"
              >
                <Ionicons name="camera-reverse" size={24} color="#9B907B" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center px-8">
              <View className="w-full h-28 border-2 border-dashed border-[#9B907B]/50 rounded-2xl justify-center items-center bg-black/20">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Помістіть номер автомобіля сюди
                </Text>
              </View>
            </View>

            <View className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center">
              <TouchableOpacity 
                onPress={handleTakePicture}
                disabled={isChecking}
                className="w-20 h-20 bg-white rounded-full p-1 justify-center items-center shadow-2xl border-4 border-slate-700/40"
              >
                {isChecking ? (
                  <ActivityIndicator size="small" color="#181c24" />
                ) : (
                  <View className="w-full h-full bg-white rounded-full border border-slate-200" />
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View className="flex-1 bg-[#181c24] justify-center items-center">
            <ActivityIndicator color="#9B907B" />
          </View>
        )}
      </View>
    </View>
  );
};

export default TakePictureScreen;