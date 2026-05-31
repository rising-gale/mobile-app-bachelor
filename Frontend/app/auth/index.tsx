import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesome5 } from "@expo/vector-icons";

import {
  useLoginMutation,
  useSignupMutation,
  useGetLocationsQuery,
} from "src/redux/api";
import DropdownModal from "src/components/DropDownModal";

const nameRegex = /^[А-ЯЁІЇЄҐа-яёіїєґA-Za-z]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const AuthScreen: React.FC = () => {
  // Переключатель вкладок: true = Логин, false = Регистрация
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);

  // Состояния для полей формы
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [passwordRepeat, setPasswordRepeat] = useState<string>("");

  // Стейты для нашего кастомного Dropdown
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [locationValue, setLocationValue] = useState<string | null>(null);
  const [locationItems, setLocationItems] = useState<any[]>([]);

  // Статусы уведомлений
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errField, setErrField] = useState<number>(0);

  // RTK Query Mutations & Queries
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const { data: locationsResponse } = useGetLocationsQuery();

  // Синхронизируем города из бэкенда
  useEffect(() => {
    if (locationsResponse?.success && locationsResponse?.data) {
      setLocationItems(locationsResponse.data);
    }
  }, [locationsResponse]);

  // Сброс ошибок при переключении вкладок
  const toggleTab = (toLogin: boolean) => {
    setIsLoginTab(toLogin);
    setErrorMessage(null);
    setSuccessMessage(null);
    setErrField(0);
  };

  // --- ХЕНДЛЕР АВТОРИЗАЦИИ ---
  const handleLogin = async () => {
    setErrorMessage(null);
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Будь ласка, заповніть всі поля");
      return;
    }

    try {
      const response = await login({ username, password }).unwrap();
      const access = response?.data?.access_token;
      const refresh = response?.data?.refresh_token;

      if (access) {
        await SecureStore.setItemAsync("access_token", "Bearer " + access);
        if (refresh) {
          await SecureStore.setItemAsync("refresh_token", refresh);
        }
        router.replace("/(drawer)/home");
      } else {
        setErrorMessage("Сервер не повернув токен доступу");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.data?.detail) {
        setErrorMessage(err.data.detail);
      } else {
        setErrorMessage("Не вдалося увійти. Перевірте з'єднання з мережею");
      }
    }
  };

  // --- ХЕНДЛЕР РЕГИСТРАЦИИ ---
  const handleRegister = async () => {
    setErrorMessage(null);
    setErrField(0);

    if (!username || username.length > 25 || username.length < 5) {
      setErrorMessage("Юзернейм користувача має бути від 5 до 25 символів");
      setErrField(1);
      return;
    }
    if (!name || !surname || !nameRegex.test(name) || !nameRegex.test(surname)) {
      setErrorMessage("Помилки в Імені чи Прізвищі (тільки літери)");
      setErrField(2);
      return;
    }
    if (!email || !emailRegex.test(email)) {
      setErrorMessage("Помилки в email (example@mail.xyz)");
      setErrField(3);
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage("Пароль занадто короткий (мін. 4 символи)");
      setErrField(4);
      return;
    }
    if (password !== passwordRepeat) {
      setErrorMessage("Паролі не співпадають");
      setErrField(5);
      return;
    }
    if (!locationValue) {
      setErrorMessage("Оберіть місто праці");
      setErrField(6);
      return;
    }

    try {
      const selectedLabel =
        locationItems.find((i) => i.value === locationValue)?.label ?? locationValue;

      await signup({
        username,
        name,
        surname,
        email,
        password,
        workLocation: { label: selectedLabel, value: locationValue },
      }).unwrap();

      setSuccessMessage("Реєстрація успішна! Тепер ви можете увійти.");
      setPassword("");
      setPasswordRepeat("");
      
      setTimeout(() => {
        toggleTab(true); 
      }, 2000);

    } catch (e: any) {
      console.error("Signup error", e);
      setErrorMessage(e?.data?.detail || "Помилка реєстрації...");
    }
  };

  // Находим выбранный лейбл города для отображения на кнопке
  const selectedLocationLabel = locationItems.find(
    (item) => item.value === locationValue
  )?.label;

  return (
    <SafeAreaView className="flex-1 bg-[#181c24]">
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md mx-auto py-6">
            
            {/* Иконка и Заголовок */}
            <View className="items-center mb-6">
              <FontAwesome5 name="user-shield" size={50} color="#9B907B" />
              <Text className="text-2xl font-bold text-[#9B907B] mt-2 tracking-wide text-center">
                {isLoginTab ? "Авторизація" : "Реєстрація"}
              </Text>
            </View>

            {/* Табы Переключения */}
            <View className="flex-row bg-[#1e2430] p-1 rounded-xl mb-6 border border-slate-800">
              <TouchableOpacity
                onPress={() => toggleTab(true)}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  isLoginTab ? "bg-[#9B907B]" : ""
                }`}
              >
                <Text className={`text-sm font-semibold ${isLoginTab ? "text-[#181c24]" : "text-slate-400"}`}>
                  Увійти
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleTab(false)}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  !isLoginTab ? "bg-[#9B907B]" : ""
                }`}
              >
                <Text className={`text-sm font-semibold ${!isLoginTab ? "text-[#181c24]" : "text-slate-400"}`}>
                  Новий аккаунт
                </Text>
              </TouchableOpacity>
            </View>

            {/* Сообщения об ошибках / успехе */}
            {errorMessage && (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                <Text className="text-red-400 text-center text-sm font-medium">{errorMessage}</Text>
              </View>
            )}
            {successMessage && (
              <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4">
                <Text className="text-emerald-400 text-center text-sm font-medium">{successMessage}</Text>
              </View>
            )}

            {/* ФОРМА ЛОГИНА */}
            {isLoginTab ? (
              <View className="flex flex-col gap-3">
                <TextInput
                  className="w-full h-12 bg-[#1e2430] border border-slate-700 rounded-xl px-4 text-[#9B907B] text-base"
                  placeholder="Нікнейм"
                  placeholderTextColor="#5a657c"
                  autoCapitalize="none"
                  onChangeText={setUsername}
                  value={username}
                />
                <TextInput
                  className="w-full h-12 bg-[#1e2430] border border-slate-700 rounded-xl px-4 text-[#9B907B] text-base"
                  placeholder="Пароль"
                  placeholderTextColor="#5a657c"
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  value={password}
                />
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoginLoading}
                  className="w-full h-12 bg-blue-600 active:bg-blue-700 rounded-xl justify-center items-center mt-4 shadow-lg"
                >
                  {isLoginLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">Увійти</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              /* ФОРМА РЕГИСТРАЦИИ */
              <View className="flex flex-col gap-3">
                <TextInput
                  className={`w-full h-12 bg-[#1e2430] border rounded-xl px-4 text-[#9B907B] text-base ${
                    errField === 1 ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="Нікнейм (тільки латиниця та цифри)"
                  placeholderTextColor="#5a657c"
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    const filteredText = text.replace(/[^a-zA-Z0-9]/g, "");
                    setUsername(filteredText);
                    if (errField === 1) setErrField(0);
                  }}
                  value={username}
                />

                <View className="flex-row gap-3">
                  <TextInput
                    className={`flex-1 h-12 bg-[#1e2430] border rounded-xl px-4 text-[#9B907B] text-base ${
                      errField === 2 ? "border-red-500" : "border-slate-700"
                    }`}
                    placeholder="Ім'я"
                    placeholderTextColor="#5a657c"
                    onChangeText={(text) => {
                      setName(text);
                      if (errField === 2) setErrField(0);
                    }}
                    value={name}
                  />
                  <TextInput
                    className={`flex-1 h-12 bg-[#1e2430] border rounded-xl px-4 text-[#9B907B] text-base ${
                      errField === 2 ? "border-red-500" : "border-slate-700"
                    }`}
                    placeholder="Прізвище"
                    placeholderTextColor="#5a657c"
                    onChangeText={(text) => {
                      setSurname(text);
                      if (errField === 2) setErrField(0);
                    }}
                    value={surname}
                  />
                </View>

                <TextInput
                  className={`w-full h-12 bg-[#1e2430] border rounded-xl px-4 text-[#9B907B] text-base ${
                    errField === 3 ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="E-mail"
                  placeholderTextColor="#5a657c"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errField === 3) setErrField(0);
                  }}
                  value={email}
                />

                <TextInput
                  className={`w-full h-12 bg-[#1e2430] border rounded-xl px-4 text-[#9B907B] text-base ${
                    errField === 4 ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="Пароль"
                  placeholderTextColor="#5a657c"
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errField === 4) setErrField(0);
                  }}
                  value={password}
                />

                <TextInput
                  className={`w-full h-12 bg-[#1e2430] border rounded-xl px-4 text-[#9B907B] text-base ${
                    errField === 5 ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="Повторіть пароль"
                  placeholderTextColor="#5a657c"
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setPasswordRepeat(text);
                    if (errField === 5) setErrField(0);
                  }}
                  value={passwordRepeat}
                />

                {/* КАСТОМНЫЙ ТРИГГЕР ДЛЯ ДРОПДАУНА */}
                <TouchableOpacity
                  onPress={() => setIsModalOpen(true)}
                  className={`w-full h-12 bg-[#1e2430] border rounded-xl px-4 flex-row items-center justify-between ${
                    errField === 6 ? "border-red-500" : "border-slate-700"
                  }`}
                >
                  <Text className={`text-base ${selectedLocationLabel ? "text-[#9B907B]" : "text-[#5a657c]"}`}>
                    {selectedLocationLabel || "Виберіть місто праці"}
                  </Text>
                  <FontAwesome5 name="chevron-down" size={14} color="#5a657c" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isSignupLoading}
                  className="w-full h-12 bg-emerald-600 active:bg-emerald-700 rounded-xl justify-center items-center mt-4 shadow-lg"
                >
                  {isSignupLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">Зареєструватись</Text>}
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ИСПОЛЬЗУЕМ ВЫНЕСЕННЫЙ КОМПОНЕНТ ДРОПДАУНА */}
      <DropdownModal
        visible={isModalOpen}
        title="Оберіть місто праці"
        items={locationItems}
        selectedValue={locationValue}
        onClose={() => setIsModalOpen(false)}
        onSelect={(value) => {
          setLocationValue(value);
          if (errField === 6) setErrField(0);
        }}
      />
    </SafeAreaView>
  );
};

export default AuthScreen;