import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { AntDesign } from '@expo/vector-icons';
import NativeCarousel from 'src/components/NativeCarousel';

// Статические ресурсы (вынесены из компонента)
const MAIN_IMAGES = [
  require('../../../assets/image1.png'),
  require('../../../assets/image2.jpg'),
  require('../../../assets/image3.jpeg'),
];

const ASSESSMENT_IMAGES = [
  require('../../../assets/assessment/1.png'),
  require('../../../assets/assessment/2.jpg'),
  require('../../../assets/assessment/3.png'),
  require('../../../assets/assessment/4.png'),
];

const HISTORY_IMAGES = [
  require('../../../assets/history/1.png'),
  require('../../../assets/history/2.png'),
];

const PROFILE_IMAGES = [
  require('../../../assets/profile/1.png'),
  require('../../../assets/profile/2.png'),
];

const INSTRUCTIONS = {
  assessment: [
    'Перейдіть до розділу "Нова перевірка" в меню;',
    'Натисніть кнопку "Зробити фото";',
    'Зробіть фотографію натиснувши круглу кнопку;',
    'Перевірте знайдені дані про т/з;',
    'Натисніть кнопку "Продовжити" та заповніть форму для збереження перевірки чи натисніть "Відмінити". Нова перевірка з\'явиться в розділі "Історія" в меню.',
  ],
  history: [
    'Перейдіть до розділу "Історія" в меню;',
    'Для перегляду будь-якої історії просто натисніть на неї;',
    'Внизу сторінки можна видалити цю перевірку;',
  ],
  profile: [
    'Перейдіть до розділу "Налаштування" в меню;',
    'Для редагування профілю натисніть кнопку "Редагувати";',
    'Для збереження або відміни змін натисніть відповідні кнопки;',
    'Для того, щоб вийти з аккаунта натисніть кнопку "Вийти".',
  ],
};

interface InstructionsState {
  assessmentPartOpened: boolean;
  historyPartOpened: boolean;
  profilePartOpened: boolean;
}


// ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
const HomePage: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const containerPadding = 32; // px-4 с двух сторон (16 + 16)
  const carouselWidth = screenWidth - containerPadding;

  const [openedSections, setOpenedSections] = useState<InstructionsState>({
    assessmentPartOpened: false,
    historyPartOpened: false,
    profilePartOpened: false,
  });

  const toggleSection = (section: keyof InstructionsState) => {
    setOpenedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <View className="flex-1 bg-[#181c24]">
      <StatusBar barStyle="light-content" />
      <Drawer.Screen 
        options={{ 
          headerShown: true, 
          title: 'Доброго дня!', 
          headerStyle: { backgroundColor: '#1e2430' },
          headerTintColor: '#9B907B',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => <DrawerToggleButton tintColor='#9B907B' /> 
        }} 
      />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        
        <Text className="text-lg font-bold text-center text-slate-400 my-5 px-2">
          Інструкція щодо користування застосунком надана нижче:
        </Text>

        {/* ГЛАВНАЯ КАРУСЕЛЬ (АВТОПЛЕЙ ДЛЯ FLATLIST ТУТ ОПУЩЕН ДЛЯ СТАБИЛЬНОСТИ, НО СВАЙП РАБОТАЕТ ИДЕАЛЬНО) */}
        <View className="mb-8">
          <NativeCarousel data={MAIN_IMAGES} width={carouselWidth} height={200} resizeMode="cover" />
        </View>

        {/* СЕКЦИЯ: НОВА ПЕРЕВІРКА */}
        <TouchableOpacity 
          activeOpacity={0.7}
          className="flex-row justify-between items-center py-4 border-b border-slate-800/60" 
          onPress={() => toggleSection('assessmentPartOpened')}
        >
          <Text className="text-lg font-bold text-slate-300">Нова перевірка</Text>
          <AntDesign name={openedSections.assessmentPartOpened ? "up" : "down"} size={20} color="#9ba1a7" />
        </TouchableOpacity>
        
        {openedSections.assessmentPartOpened && (
          <View className="mt-4 mb-2">
            <NativeCarousel data={ASSESSMENT_IMAGES} width={carouselWidth} height={220} resizeMode="contain" />
            <View className="bg-slate-900/40 p-4 rounded-xl mt-4 border border-slate-800/40">
              {INSTRUCTIONS.assessment.map((step, index) => (
                <Text key={index} className="text-sm text-slate-400 mb-2 leading-relaxed text-justify">
                  <Text className="font-bold text-emerald-500">{index + 1}. </Text>{step}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* СЕКЦИЯ: ІСТОРІЯ ПЕРЕВІРОК */}
        <TouchableOpacity 
          activeOpacity={0.7}
          className="flex-row justify-between items-center py-4 border-b border-slate-800/60 mt-2" 
          onPress={() => toggleSection('historyPartOpened')}
        >
          <Text className="text-lg font-bold text-slate-300">Історія перевірок</Text>
          <AntDesign name={openedSections.historyPartOpened ? "up" : "down"} size={20} color="#9ba1a7" />
        </TouchableOpacity>
        
        {openedSections.historyPartOpened && (
          <View className="mt-4 mb-2">
            <NativeCarousel data={HISTORY_IMAGES} width={carouselWidth} height={220} resizeMode="contain" />
            <View className="bg-slate-900/40 p-4 rounded-xl mt-4 border border-slate-800/40">
              {INSTRUCTIONS.history.map((step, index) => (
                <Text key={index} className="text-sm text-slate-400 mb-2 leading-relaxed text-justify">
                  <Text className="font-bold text-emerald-500">{index + 1}. </Text>{step}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* СЕКЦИЯ: ПРОФІЛЬ КОРИСТУВАЧА */}
        <TouchableOpacity 
          activeOpacity={0.7}
          className="flex-row justify-between items-center py-4 border-b border-slate-800/60 mt-2" 
          onPress={() => toggleSection('profilePartOpened')}
        >
          <Text className="text-lg font-bold text-slate-300">Профіль користувача</Text>
          <AntDesign name={openedSections.profilePartOpened ? "up" : "down"} size={20} color="#9ba1a7" />
        </TouchableOpacity>
        
        {openedSections.profilePartOpened && (
          <View className="mt-4 mb-2">
            <NativeCarousel data={PROFILE_IMAGES} width={carouselWidth} height={220} resizeMode="contain" />
            <View className="bg-slate-900/40 p-4 rounded-xl mt-4 border border-slate-800/40">
              {INSTRUCTIONS.profile.map((step, index) => (
                <Text key={index} className="text-sm text-slate-400 mb-2 leading-relaxed text-justify">
                  <Text className="font-bold text-emerald-500">{index + 1}. </Text>{step}
                </Text>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

export default HomePage;