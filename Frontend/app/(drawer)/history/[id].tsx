import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// Импорт RTK Query хуков из твоего API
import {
  useGetAssessmentByIdQuery,
  useGetNumberQuery,
  useDeleteAssessmentByIdMutation,
} from "src/redux/api";

import CarInfoComponent from "src/components/CarInfoComponent";
import ButtonSubmitCancel from "src/components/ButtonSubmitCancel";
import getResultConfig from "src/functions/getResultConfig";
import formatDate from "src/functions/formateDate";

const HistoryItemPage: React.FC = () => {
  // Получаем строго id из параметров пути
  const { id, justSaved } = useLocalSearchParams<{ id: string; justSaved?: string }>();
  const [carInfoVisible, setCarInfoVisible] = useState<boolean>(false);
  // Base URL: use env var if provided, fallback to localhost
  const API_BASE_URL =
    (process.env.EXPO_PUBLIC_API_URL as string) || "http://127.0.0.1:8080/";
  // 1. Запрос данных конкретной проверки по ID
  const { data: assessmentResponse, isLoading: isAssessmentLoading } =
    useGetAssessmentByIdQuery(id ?? "");
  const assessment = assessmentResponse?.data;
  console.log("Assessment: ", assessment);
  // 2. Зависимый запрос данных автомобиля (выполняется только когда получили digits)
  const { data: numberInfoResponse, isLoading: isNumberLoading } =
    useGetNumberQuery(assessment?.digits ?? "", { skip: !assessment?.digits });

  // console.log("numberInfoResponse: ", numberInfoResponse);

  // 3. Мутация удаления проверки
  const [deleteAssessment, { isLoading: isDeleting }] =
    useDeleteAssessmentByIdMutation();

  const handleCancelAction = async () => {
    if (!id) return;
    try {
      // Вызываем мутацию, unwrap() позволяет поймать ошибку в catch, если она будет
      await deleteAssessment(id).unwrap();
      router.replace("/history/status");
    } catch (err) {
      console.error("Помилка при видаленні перевірки:", err);
    }
  };

  if (isAssessmentLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#181c24] justify-center items-center">
        <ActivityIndicator size="large" color="#9B907B" />
        <Text className="text-slate-400 mt-3 text-sm">
          Завантаження даних перевірки...
        </Text>
      </SafeAreaView>
    );
  }

  if (!assessment) {
    return (
      <SafeAreaView className="flex-1 bg-[#181c24] justify-center items-center px-6">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color="#ef4444"
        />
        <Text className="text-slate-200 mt-4 text-base font-semibold text-center">
          Перевірку не знайдено або її було видалено
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-[#1e2430] border border-slate-800 px-6 py-2.5 rounded-xl"
        >
          <Text className="text-[#9B907B] font-bold">Повернутися назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const resultStyle = getResultConfig(assessment.result);

  // Безопасный фоллбек для изображений
  const imageSource =
    assessment.image && assessment.image.length > 0
      ? { uri: `${API_BASE_URL}/image/${assessment.image}` }
      : {
          uri: "https://baza-gai.com.ua/catalog-images/lamborghini/huracan/model.jpg",
        };

  return (
    <SafeAreaView
      className="flex-1 bg-[#181c24]"
      edges={["bottom", "left", "right"]}
    >
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerTitle: assessment.digits || "Деталі перевірки",
          headerStyle: { backgroundColor: "#1e2430" },
          headerTintColor: "#9B907B",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
        }}
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Контейнер картинки */}
        <View className="w-full h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/60 mb-5 shadow-lg">
          <Image
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            source={imageSource}
          />
        </View>

        {/* Главный блок результатов */}
        <View className="bg-[#1e2430] border border-slate-800 rounded-2xl p-4 mb-5 shadow-sm">
          {/* Маршрут (Откуда -> Куда) */}
          <View className="flex-row justify-between items-center bg-slate-950/40 rounded-xl p-4 mb-5 border border-slate-900/50">
            <View className="flex-1 items-center">
              <MaterialCommunityIcons
                name="location-exit"
                size={24}
                color="#ef4444"
              />
              <Text className="text-slate-300 font-bold text-sm mt-1 text-center">
                {assessment.location?.label ||
                  (assessment.location as unknown as string) ||
                  "—"}
              </Text>
            </View>

            <FontAwesome5
              name="long-arrow-alt-right"
              size={20}
              color="#9B907B"
              className="mx-2"
            />

            <View className="flex-1 items-center">
              <MaterialCommunityIcons
                name="location-enter"
                size={24}
                color="#10b981"
              />
              <Text className="text-slate-300 font-bold text-sm mt-1 text-center">
                {assessment.direction?.label ||
                  (assessment.direction as unknown as string) ||
                  "—"}
              </Text>
            </View>
          </View>

          {/* Строка: Результат проверки */}
          <View className="flex-row items-start border-b border-slate-800/60 pb-3 mb-3">
            <View className="w-10 items-center justify-center pt-1">
              <MaterialCommunityIcons
                name={resultStyle.icon as any}
                size={24}
                color={
                  resultStyle.text.includes("emerald")
                    ? "#10b981"
                    : resultStyle.text.includes("red")
                      ? "#ef4444"
                      : "#f59e0b"
                }
              />
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Результат перевірки
              </Text>
              <View
                className={`inline-flex self-start px-2 py-0.5 rounded mt-1 border ${resultStyle.bg}`}
              >
                <Text className={`text-sm font-bold ${resultStyle.text}`}>
                  {resultStyle.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Строка: Комментарий проверяющего */}
          <View className="flex-row items-start border-b border-slate-800/60 pb-3 mb-3">
            <View className="w-10 items-center justify-center pt-1">
              <MaterialCommunityIcons
                name="comment-text-multiple-outline"
                size={22}
                color="#9B907B"
              />
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Коментар оператора
              </Text>
              <Text className="text-base font-medium text-slate-300 mt-1 leading-relaxed">
                {assessment.comment || "Коментар відсутній"}
              </Text>
            </View>
          </View>

          {/* Строка: Дата и Время */}
          <View className="flex-row items-start">
            <View className="w-10 items-center justify-center pt-1">
              <FontAwesome5 name="calendar-alt" size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Дата та час перевірки
              </Text>
              <Text className="text-base font-bold text-slate-300 mt-0.5">
                {formatDate(assessment.date_time)}
              </Text>
            </View>
          </View>
        </View>

        {/* Выпадающая панель технической информации из базы */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ transform: [{ translateX: 0 }] }}
          className="flex-row justify-between items-center bg-[#1e2430] border border-slate-800 rounded-2xl p-4 mb-4 active:bg-slate-800/60"
          onPress={() => setCarInfoVisible(!carInfoVisible)}
        >
          <View className="flex-row items-center gap-3">
            <FontAwesome5 name="car" size={18} color="#9B907B" />
            <Text className="text-base font-bold text-slate-300">
              Інформація по номеру з бази
            </Text>
          </View>
          <AntDesign
            name={carInfoVisible ? "up" : "down"}
            size={18}
            color="#5a657c"
          />
        </TouchableOpacity>

        {/* Рендер компонента тех. информации */}
        {carInfoVisible && (
          <View className="mb-4 bg-[#14171b] border border-slate-900 rounded-2xl p-2">
            {isNumberLoading ? (
              <View className="py-6 justify-center items-center">
                <ActivityIndicator size="small" color="#9B907B" />
                <Text className="text-slate-500 text-xs mt-2">
                  Запитуємо МРЕВ дані...
                </Text>
              </View>
            ) : (
              <CarInfoComponent info={numberInfoResponse?.data?.number_info} />
            )}
          </View>
        )}

        {/* Кнопка действия */}
        <View className="mt-4">
          <ButtonSubmitCancel
            buttonSubmitText="На головну"
            buttonCancelText={
              isDeleting ? "Видалення..." : "Видалити перевірку"
            }
            submitAction={() => router.replace("/")} // Возвращает на главный экран сканирования/ввода
            cancelAction={handleCancelAction} // Удаляет текущую запись
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryItemPage;
