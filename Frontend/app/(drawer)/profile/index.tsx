import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Импортируем твои RTK Query эндпоинты и типы
import { useGetMeQuery, useUpdateUserMutation, useGetLocationsQuery } from 'src/redux/api';
import DropdownModal from 'src/components/DropDownModal';
import { CityChoice } from 'src/types/api';

// Разрешаем null для начального состояния формы
interface ProfileFormState {
  name: string;
  surname: string;
  workLocation: CityChoice | null;
}

const nameRegex = /^[А-ЯЁІЇЄҐа-яёіїєґA-Za-z]+$/;

const ProfilePage: React.FC = () => {
  // 1. RTK Query Hooks
  const { data: userResponse, isLoading: isUserLoading } = useGetMeQuery();
  const { data: locationsResponse } = useGetLocationsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserMutation();

  const userInfo = userResponse?.data;

  // 2. Local States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormState>({
    name: '',
    surname: '',
    workLocation: null,
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [errField, setErrField] = useState<number>(0); // 1: name/surname, 2: location

  // Синхронизируем данные формы при загрузке профиля из RTK Query
  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        surname: userInfo.surname || '',
        workLocation: userInfo.workLocation || null,
      });
    }
  }, [userInfo, isEditing]);

  const locationItems = locationsResponse?.data || [];

  // Поскольку в formData теперь лежит полноценный объект, имя города берем прямо из него
  const selectedLocationLabel = formData.workLocation?.label || '';

  // 3. Валидация и отправка изменений
  const handleSave = async () => {
    setErrorText(null);
    setErrField(0);

    if (!formData.name.trim() || !formData.surname.trim() || !nameRegex.test(formData.name) || !nameRegex.test(formData.surname)) {
      setErrorText('Помилки в Імені чи Прізвищі (тільки літери)');
      setErrField(1);
      return;
    }

    if (!formData.workLocation) {
      setErrorText('Оберіть місто праці');
      setErrField(2);
      return;
    }

    try {
      // Отправляем мутацию на бэк с объектом { label, value } в workLocation
      await updateProfile({
        username: userInfo?.username,
        name: formData.name,
        surname: formData.surname,
        workLocation: formData.workLocation,
      }).unwrap();

      setIsEditing(false);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setErrorText(err?.data?.detail || 'Не вдалося оновити профіль');
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    router.replace('/auth');
  };

  if (isUserLoading) {
    return (
      <View className="flex-1 bg-[#181c24] justify-center items-center">
        <ActivityIndicator size="large" color="#9B907B" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#181c24]">
      <Drawer.Screen 
        options={{ 
          headerShown: true, 
          title: 'Ваш профіль', 
          headerStyle: { backgroundColor: '#1e2430' },
          headerTintColor: '#9B907B',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => <DrawerToggleButton tintColor='#9B907B' /> 
        }} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6" 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Аватар-заглушка */}
          <View className="items-center my-6">
            <View className="w-24 h-24 bg-[#252d3d] rounded-full justify-center items-center border-2 border-[#9B907B] shadow-xl">
              <Text className="text-[#9B907B] text-3xl font-bold">
                {userInfo?.name ? userInfo.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <Text className="text-slate-400 text-sm mt-2">@{userInfo?.username || 'username'}</Text>
          </View>

          {/* Вывод ошибки */}
          {errorText && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-sm font-medium">{errorText}</Text>
            </View>
          )}

          {/* Блок полей */}
          <View className="bg-[#1e2430] rounded-2xl p-4 border border-slate-800/80 gap-y-4 shadow-lg">
            
            {/* Username */}
            <View className="flex-row items-center border-b border-slate-800/60 pb-3">
              <View className="w-10 justify-center"><AntDesign name="user" size={24} color="#6D7992" /></View>
              <View className="flex-1 pl-2">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</Text>
                <Text className="text-base text-slate-300 mt-0.5 font-medium">{userInfo?.username}</Text>
              </View>
            </View>

            {/* E-mail */}
            <View className="flex-row items-center border-b border-slate-800/60 pb-3">
              <View className="w-10 justify-center"><MaterialIcons name="email" size={24} color="#6D7992" /></View>
              <View className="flex-1 pl-2">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</Text>
                <Text className="text-base text-slate-400 mt-0.5 font-medium">{userInfo?.email}</Text>
              </View>
              {isEditing && <FontAwesome5 name="lock" size={12} color="#5a657c" className="mr-2" />}
            </View>

            {/* Имя и Фамилия */}
            <View className="flex-row items-center border-b border-slate-800/60 pb-3">
              <View className="w-10 justify-center"><FontAwesome5 name="user-check" size={20} color="#6D7992" /></View>
              <View className="flex-1 pl-2">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ім'я та прізвище</Text>
                {isEditing ? (
                  <View className="flex-row gap-x-2 mt-2">
                    <TextInput
                      className={`flex-1 h-10 bg-[#181c24] border rounded-lg px-3 text-[#9B907B] text-sm ${
                        errField === 1 ? 'border-red-500' : 'border-slate-700'
                      }`}
                      placeholder="Ім'я"
                      placeholderTextColor="#5a657c"
                      value={formData.name}
                      onChangeText={(text) => setFormData(p => ({ ...p, name: text }))}
                    />
                    <TextInput
                      className={`flex-1 h-10 bg-[#181c24] border rounded-lg px-3 text-[#9B907B] text-sm ${
                        errField === 1 ? 'border-red-500' : 'border-slate-700'
                      }`}
                      placeholder="Прізвище"
                      placeholderTextColor="#5a657c"
                      value={formData.surname}
                      onChangeText={(text) => setFormData(p => ({ ...p, surname: text }))}
                    />
                  </View>
                ) : (
                  <Text className="text-base text-slate-300 mt-0.5 font-medium">
                    {userInfo?.name} {userInfo?.surname}
                  </Text>
                )}
              </View>
            </View>

            {/* Место работы */}
            <View className="flex-row items-center pb-1">
              <View className="w-10 justify-center"><MaterialIcons name="place" size={24} color="#6D7992" /></View>
              <View className="flex-1 pl-2">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">Місце праці</Text>
                {isEditing ? (
                  <TouchableOpacity
                    onPress={() => setIsModalOpen(true)}
                    className={`w-full h-10 bg-[#181c24] border rounded-lg px-3 flex-row items-center justify-between mt-2 ${
                      errField === 2 ? 'border-red-500' : 'border-slate-700'
                    }`}
                  >
                    <Text className={`text-sm ${selectedLocationLabel ? 'text-[#9B907B]' : 'text-[#5a657c]'}`}>
                      {selectedLocationLabel || 'Виберіть місто'}
                    </Text>
                    <FontAwesome5 name="chevron-down" size={12} color="#5a657c" />
                  </TouchableOpacity>
                ) : (
                  <Text className="text-base text-slate-300 mt-0.5 font-medium">
                    {selectedLocationLabel || 'Не вказано'}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Кнопки управления */}
          <View className="flex-row justify-center gap-x-4 mt-8">
            {isEditing ? (
              <>
                <TouchableOpacity 
                  onPress={handleSave} 
                  disabled={isUpdating}
                  className="flex-1 h-12 bg-emerald-600 active:bg-emerald-700 rounded-xl justify-center items-center shadow-lg max-w-[160px]"
                >
                  {isUpdating ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">Зберегти</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsEditing(false)}
                  className="flex-1 h-12 bg-red-600/90 active:bg-red-700 rounded-xl justify-center items-center shadow-lg max-w-[160px]"
                >
                  <Text className="text-white text-base font-bold">Відмінити</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                onPress={() => setIsEditing(true)}
                className="w-full h-12 bg-[#9B907B] active:bg-[#867b67] rounded-xl justify-center items-center shadow-lg max-w-[240px]"
              >
                <Text className="text-[#181c24] text-base font-bold">Редагувати профіль</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Кнопка выхода */}
          <View className="flex-1 justify-end items-center mt-12">
            <TouchableOpacity 
              onPress={handleLogout}
              className="flex-row items-center space-x-2 bg-slate-900/40 px-5 py-2.5 rounded-full border border-slate-800/40 active:bg-slate-800/40"
            >
              <Text className="text-red-400 text-base font-semibold">Вийти з акаунта</Text>
              <MaterialIcons name="logout" size={20} color="#f87171" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Наш Дропдаун-Модал */}
      <DropdownModal
        visible={isModalOpen}
        title="Оберіть місто праці"
        items={locationItems}
        selectedValue={formData.workLocation?.value || null} 
        onClose={() => setIsModalOpen(false)}
        onSelect={(value) => {
          const selectedCity = locationItems.find((item: any) => item.value === value);
          if (selectedCity) {
            setFormData((prev) => ({
              ...prev,
              workLocation: {
                label: selectedCity.label,
                value: selectedCity.value,
              },
            }));
            if (errField === 2) setErrField(0);
          }
        }}
      />
    </View>
  );
};

export default ProfilePage;