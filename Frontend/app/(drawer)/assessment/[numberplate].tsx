import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Импортируем компоненты отображения данных, новый блок кнопок и RTK Query
import CarInfoComponent from 'src/components/CarInfoComponent';
import AssessmentHistory from 'src/components/AssessmentHistory';
import ButtonSubmitCancel from 'src/components/ButtonSubmitCancel'; 
import { useGetNumberQuery } from 'src/redux/api'; 

const AssessmentPage: React.FC = () => {
  // Получаем [numberplate] из динамического пути и imageUri локального фото из параметров
  const { numberplate, imageUri } = useLocalSearchParams<{ numberplate: string; imageUri: string }>();
  
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);

  // Автоматический RTK Query запрос по строке номера автомобиля
  const { data: response, isLoading, isError, error } = useGetNumberQuery(numberplate || '', {
    skip: !numberplate, 
  });

  const info = response?.data; 

  // Действие кнопки "Продолжить" -> ведет дальше на форму создания инспекции
  const handleConfirmAndProceed = () => {
    router.push({
      pathname: '/assessment/form',
      params: { numberplate, imageUri } 
    });
  };

  // Действие кнопки "Отмена" -> очищаем роут, возвращаемся на камеру
  const handleCancelAndBack = () => {
    router.replace('/assessment'); 
  };

  return (
    <View className="flex-1 bg-[#181c24]">
      <StatusBar style="light" />
      <Drawer.Screen 
        options={{ 
          headerShown: true, 
          title: `Перевірка даних`, 
          headerStyle: { backgroundColor: '#1e2430' }, 
          headerTintColor: '#9B907B',
          headerLeft: () => <DrawerToggleButton tintColor='#9B907B' /> 
        }} 
      />

      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#9B907B" />
            <Text className="text-slate-400 text-sm mt-4 font-medium">Отримуємо дані з бази апі...</Text>
          </View>
        ) : isError ? (
          <View className="flex-1 justify-center items-center px-6">
            <MaterialIcons name="error-outline" size={50} color="#ef4444" />
            <Text className="text-red-400 text-center font-semibold mt-4 text-base">
              {(error as any)?.data?.detail || 'Не вдалося завантажити дані про автомобіль'}
            </Text>
            <TouchableOpacity 
              onPress={handleCancelAndBack}
              className="mt-6 bg-[#9B907B] px-6 py-2.5 rounded-xl"
            >
              <Text className="text-[#181c24] font-bold">Повернутись до камери</Text>
            </TouchableOpacity>
          </View>
        ) : info ? (
          <ScrollView 
            className="flex-1 px-3"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Красивый плашка-визуал государственного номера */}
            <View className="items-center my-4">
              <View className="bg-white border-2 border-slate-800 rounded-lg px-6 py-2 shadow-md flex-row items-center space-x-3">
                <View className="bg-blue-700 w-4 h-8 justify-between items-center rounded-sm py-0.5">
                  <Text className="text-[6px] text-yellow-400 font-bold">UA</Text>
                </View>
                <Text className="text-2xl font-black tracking-widest text-slate-900 uppercase">
                  {numberplate}
                </Text>
              </View>
            </View>

            {/* Контейнер для СДЕЛАННОГО локального фото */}
            <View className="bg-[#1e2430] p-2 rounded-2xl border border-slate-800/80 shadow-lg mb-4">
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }} 
                  className="w-full h-52 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-52 bg-[#252d3d] rounded-xl justify-center items-center">
                  <FontAwesome5 name="car" size={40} color="#6D7992" />
                  <Text className="text-slate-500 text-xs mt-2">Фотографія автомобіля відсутня</Text>
                </View>
              )}
            </View>

            {/* Блок VIN кода */}
            <View className="bg-[#1e2430] rounded-xl p-4 border border-slate-800/80 flex-row items-center mb-4 shadow-sm">
              <View className="w-10 h-10 bg-[#252d3d] rounded-lg justify-center items-center mr-3">
                <FontAwesome5 name="fingerprint" size={18} color="#9B907B" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIN Номер</Text>
                <Text className="text-base font-semibold text-slate-300 mt-0.5">
                  {info.number_info?.vin || 'Інформація відсутня'}
                </Text>
              </View>
            </View>

            {/* Дополнительный компонент с техническими характеристиками ТС */}
            {info.number_info && <CarInfoComponent info={info.number_info} />}

            {/* Выпадающий список истории проверок */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setHistoryVisible(p => !p)}
              className="bg-[#1e2430] border border-slate-800/80 rounded-xl p-4 flex-row justify-between items-center my-4 shadow-sm"
            >
              <View className="flex-row items-center space-x-3">
                <MaterialIcons name="history" size={22} color="#6D7992" />
                <Text className="text-base font-bold text-slate-300">Історія попередніх перевірок</Text>
              </View>
              <AntDesign name={historyVisible ? "up" : "down"} size={18} color="#9B907B" />
            </TouchableOpacity>

            {historyVisible && (
              <View className="bg-[#1e2430]/50 border border-slate-800/40 rounded-xl p-2 mb-1">
                <AssessmentHistory history={info?.number_history || []} />
              </View>
            )}

            {/* Интегрированный общий компонент кнопок управления */}
            <ButtonSubmitCancel 
              submitAction={handleConfirmAndProceed}
              cancelAction={handleCancelAndBack}
            />

          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-slate-400">Дані відсутні</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AssessmentPage;