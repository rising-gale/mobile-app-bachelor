import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// Импортируем хуки API и переиспользуемые компоненты
import {
  useSubmitAssessmentMutation,
  useGetMeQuery,
  useGetLocationsQuery,
} from "src/redux/api";
import ButtonSubmitCancel from "src/components/ButtonSubmitCancel";
import DropdownModal, { DropdownItem } from "src/components/DropDownModal";

const AssessmentFormPage: React.FC = () => {
  const { numberplate, imageUri } = useLocalSearchParams<{
    numberplate: string;
    imageUri: string;
  }>();

  // 1. Получаем данные профиля текущего оператора
  const { data: userResponse, isLoading: isUserLoading } = useGetMeQuery();
  const userLocation = userResponse?.data?.workLocation;

  // 2. Получаем список всех локаций для селектора направления
  const { data: locationsResponse, isLoading: isLocationsLoading } =
    useGetLocationsQuery();

  // 3. Мутация для отправки единого FormData
  const [submitAssessment, { isLoading: isSubmitting }] =
    useSubmitAssessmentMutation();

  // Состояния для значений полей
  const [comment, setComment] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Состояния для Управления модальными окнами (видимость)
  const [isResultModalVisible, setIsResultModalVisible] =
    useState<boolean>(false);
  const [isDirectionModalVisible, setIsDirectionModalVisible] =
    useState<boolean>(false);

  // Варианты выбора для Результата Проверки (ResultEnum)
  const [resultValue, setResultValue] = useState<string | null>(null);
  const resultItems: DropdownItem[] = [
    { label: "Все в порядку (OK)", value: "Ok" },
    { label: "Проблеми з документами", value: "Problematic" },
    { label: "В проїзді відмовлено", value: "Denied" },
  ];

  // Варианты выбора для Направления движения
  const [directionValue, setDirectionValue] = useState<string | null>(null);
  const [directionItems, setDirectionItems] = useState<DropdownItem[]>([]);

  // Синхронизация данных локаций из API со стейтом
  useEffect(() => {
    if (locationsResponse?.data) {
      const formattedLocations = locationsResponse.data.map((loc) => ({
        label: loc.label,
        value: loc.value,
      }));
      setDirectionItems(formattedLocations);
    }
  }, [locationsResponse]);

  // Сброс ошибок при изменении данных
  useEffect(() => {
    setValidationError("");
  }, [comment, resultValue, directionValue]);

  // Находим выбранные лейблы для красивого отображения в полях-триггерах
  const selectedResultLabel = resultItems.find(
    (item) => item.value === resultValue,
  )?.label;
  const selectedDirectionLabel = directionItems.find(
    (item) => item.value === directionValue,
  )?.label;

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!resultValue) {
      setValidationError("Будь ласка, оберіть результат перевірки");
      return;
    }
    if (!directionValue) {
      setValidationError("Будь ласка, вкажіть напрям руху автомобіля");
      return;
    }

    const selectedDirectionObj = directionItems.find(
      (item) => item.value === directionValue,
    );

    try {
      const formData = new FormData();
      formData.append("digits", numberplate || "");
      formData.append("result", resultValue);
      formData.append("comment", comment.trim() || "-");

      if (userLocation) {
        formData.append("location", JSON.stringify(userLocation));
      }
      if (selectedDirectionObj) {
        formData.append(
          "direction",
          JSON.stringify({
            label: selectedDirectionObj.label,
            value: selectedDirectionObj.value,
          }),
        );
      }

      if (imageUri) {
        const filename = imageUri.split("/").pop() || "assessment_photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const response = await submitAssessment(formData).unwrap();

      if (response.success && response.data?.id) {
        // Перенаправляем на страницу деталей инспекции, заменяя экран формы в истории переходов
        router.replace({
            pathname: `/history/${response.data.id}`,
            params: { justSaved: 'true' }
            });
      } else {
        setValidationError(
          response.message || "Сталася помилка при збереженні форми",
        );
      }
    } catch (error: any) {
      console.error("Submit assessment error:", error);
      const backendError =
        error?.data?.detail || "Не вдалося надіслати звіт на сервер";
      Alert.alert("Помилка сервера", backendError);
    }
  };

  if (isUserLoading || isLocationsLoading) {
    return (
      <View className="flex-1 bg-[#181c24] justify-center items-center">
        <ActivityIndicator size="large" color="#9B907B" />
        <Text className="text-slate-400 text-sm mt-3 font-medium">
          Синхронізація даних з сервером...
        </Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-[#181c24]">
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Информационный шильдик текущего ТС */}
          <View className="bg-[#1e2430] p-4 rounded-xl border border-slate-800/80 my-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center space-x-3">
              <Ionicons name="car-sport-outline" size={22} color="#9B907B" />
              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Об'єкт перевірки
                </Text>
                <Text className="text-lg font-black text-slate-200 tracking-wide uppercase mt-0.5">
                  {numberplate}
                </Text>
              </View>
            </View>
            <View className="bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                Активна сесія
              </Text>
            </View>
          </View>

          {/* Статическая локация текущего пользователя */}
          <View className="bg-[#1e2430] p-4 rounded-xl border border-slate-800/80 mb-6 flex-row items-center shadow-sm">
            <View className="w-9 h-9 bg-[#252d3d] rounded-lg justify-center items-center mr-3">
              <Ionicons name="location" size={18} color="#f43f5e" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Поточний блокпост / Локація
              </Text>
              <Text className="text-sm font-semibold text-slate-300 mt-0.5">
                {userLocation
                  ? `${userLocation.label}`
                  : "Локація не визначена"}
              </Text>
            </View>
          </View>

          {/* === ПОЛЕ-ТРИГГЕР 1: РЕЗУЛЬТАТ ПРОВЕРКИ === */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
              Результат перевірки <Text className="text-rose-500">*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsResultModalVisible(true)}
              className="w-full bg-[#1e2430] border border-slate-700/60 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
            >
              <Text
                className={`text-sm ${resultValue ? "text-slate-200 font-medium" : "text-slate-500"}`}
              >
                {selectedResultLabel || "Оберіть статус рішення..."}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* === ПОЛЕ-ТРИГГЕР 2: НАПРАВЛЕНИЕ ДВИЖЕНИЯ === */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
              Напрям руху Т/З <Text className="text-rose-500">*</Text>
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsDirectionModalVisible(true)}
              className="w-full bg-[#1e2430] border border-slate-700/60 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
            >
              <Text
                className={`text-sm ${directionValue ? "text-slate-200 font-medium" : "text-slate-500"}`}
              >
                {selectedDirectionLabel || "Оберіть куди прямує..."}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* ТЕКСТОВОЕ ПОЛЕ: КОММЕНТАРИЙ */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
              Коментар перевіряючого
            </Text>
            <View className="bg-[#1e2430] border border-slate-700/60 rounded-xl p-3 flex-row items-start">
              <MaterialCommunityIcons
                name="comment-text-outline"
                size={18}
                color="#6D7992"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <TextInput
                editable={!isSubmitting}
                multiline
                numberOfLines={4}
                maxLength={250}
                placeholder="Введіть зауваження або поставте дефіс..."
                placeholderTextColor="#5a677d"
                value={comment}
                onChangeText={setComment}
                style={{
                  flex: 1,
                  color: "#e2e8f0",
                  fontSize: 14,
                  textAlignVertical: "top",
                  minHeight: 80,
                }}
              />
            </View>
          </View>

          {/* Блок валидационных ошибок */}
          {validationError ? (
            <View className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 my-2 flex-row items-center space-x-2">
              <Feather name="alert-triangle" size={16} color="#f43f5e" />
              <Text className="text-rose-400 text-xs font-semibold flex-1">
                {validationError}
              </Text>
            </View>
          ) : null}

          {/* Индикатор сетевой отправки */}
          {isSubmitting && (
            <View className="flex-row items-center justify-center space-x-2 my-2">
              <ActivityIndicator size="small" color="#9B907B" />
              <Text className="text-slate-400 text-xs font-medium">
                Надсилання звіту та медіафайлів...
              </Text>
            </View>
          )}

          {/* Кнопки Действия */}
          <ButtonSubmitCancel
            buttonSubmitText="Зберегти"
            buttonCancelText="Назад"
            submitAction={handleSubmit}
            cancelAction={handleCancel}
          />
        </ScrollView>
        {/* Модалка результата проверки */}
        <DropdownModal
          visible={isResultModalVisible}
          onClose={() => setIsResultModalVisible(false)}
          title="Результат перевірки"
          items={resultItems}
          selectedValue={resultValue}
          onSelect={(value) => setResultValue(value)}
        />
        {/* Модалка направления движения (динамическая из API) */}
        <DropdownModal
          visible={isDirectionModalVisible}
          onClose={() => setIsDirectionModalVisible(false)}
          title="Оберіть напрям руху"
          items={directionItems}
          selectedValue={directionValue}
          onSelect={(value) => setDirectionValue(value)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AssessmentFormPage;
