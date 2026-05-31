import { Stack } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { sharedStackOptions } from 'src/config/theme';

const HistoryLayout = () => {
  return (
    <Stack screenOptions={sharedStackOptions}>
      {/* Список истории */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Історія перевірок',
          headerLeft: () => <DrawerToggleButton tintColor='#9B907B' /> // Бургер меню
        }} 
      />
      {/* Страница деталей (id).*/}
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Деталі перевірки' 
        }} 
      />
    </Stack>
  );
};

export default HistoryLayout;