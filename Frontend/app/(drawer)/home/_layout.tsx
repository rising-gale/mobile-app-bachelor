import { Stack } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { sharedStackOptions } from 'src/config/theme'; // Импортируем наш конфиг

const HomeLayout = () => {
  return (
    <Stack screenOptions={sharedStackOptions}>
      {/* Главный экран папки home */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Головна',
          headerLeft: () => <DrawerToggleButton tintColor='#9B907B' /> // Кнопка бургера слева
        }} 
      />
    </Stack>
  );
};

export default HomeLayout;