import React from "react";
import { View, Text } from "react-native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import formatDate from "src/functions/formateDate";
import { AssessmentSummary } from "src/redux/api";
import getResultConfig from "src/functions/getResultConfig";

interface AssessmentHistoryProps {
  history?: AssessmentSummary[];
}

const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  history = [],
}) => {
  // Если история пуста — выводим дружелюбный placeholder state
  if (history.length === 0) {
    return (
      <View className="py-6 items-center justify-center bg-[#1e2430]/30 rounded-xl border border-dashed border-slate-800">
        <Feather name="folder-minus" size={24} color="#6D7992" />
        <Text className="text-slate-500 text-sm font-medium mt-2">
          Історія попередніх перевірок відсутня
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-col space-y-1 gap-2">
      {history.map((item) => {
        const resultStyle = getResultConfig(item.result);
        const formattedDate = formatDate(item.date_time);

        return (
          <View
            key={item.id}
            className="flex-row items-center bg-[#1e2430] border border-slate-800/60 rounded-xl p-3.5 shadow-sm"
          >
            {/* Левая часть: Статус-иконка с цветной подложкой */}
            <View className="mr-4">
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
            </View>

            {/* Правая часть: Метаданные (Дата и Локация) */}
            <View className="flex-1 space-y-1">
              <View className="flex-row items-center space-x-2">
                <Feather name="calendar" size={14} color="#9B907B" />
                <Text className="text-slate-300 font-bold text-sm tracking-wide">
                  {formattedDate}
                </Text>
              </View>

              <View className="flex-row items-center space-x-2">
                <Ionicons name="location-outline" size={14} color="#6D7992" />
                <Text
                  className="text-slate-400 text-xs font-medium flex-1"
                  numberOfLines={1}
                >
                  {item.location.label || "Локація не вказана"}
                </Text>
              </View>
            </View>

            {/* Дополнительный визуальный шильдик статуса справа */}
            <View className={`px-2.5 py-1 rounded-md border ${resultStyle.bg}`}>
              <Text className={`text-xs font-bold ${resultStyle.text}`}>
                {item.result}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default AssessmentHistory;
