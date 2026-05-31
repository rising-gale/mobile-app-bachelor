import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// Импортируем автогенерируемые хуки из твоего API
import { useGetHistoryQuery, useGetPageCountQuery } from 'src/redux/api';
import PaginatorComponent from 'src/components/PaginatorComponent';
import formatDate from 'src/functions/formateDate';
import getStatusStyles from 'src/functions/getStatusStyles';

const HistoryPage: React.FC = () => {
  const [curPage, setCurPage] = useState<number>(1);

  // RTK Query автоматически делает перезапрос, когда меняется curPage!
  const { data: historyResponse, isLoading: isHistoryLoading, isFetching } = useGetHistoryQuery(curPage);
  const { data: pageCountResponse } = useGetPageCountQuery();

  const historyItems = historyResponse?.data || [];
  const pageCount = pageCountResponse?.data.page_count || 1;
  // console.log(historyItems);

  const nextPage = () => {
    if (curPage < pageCount) setCurPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (curPage > 1) setCurPage((prev) => prev - 1);
  };

  return (
    <View className="flex-1 bg-[#181c24]">
      <StatusBar barStyle="light-content" />

      {/* Основной контент */}
      <View className="flex-1">
        {isHistoryLoading || isFetching ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#9B907B" />
            <Text className="text-slate-400 mt-2 text-sm">Завантаження історії...</Text>
          </View>
        ) : historyItems.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <FontAwesome5 name="folder-open" size={48} color="#5a657c" />
            <Text className="text-slate-400 mt-4 text-base font-medium text-center">
              Історія перевірок порожня
            </Text>
          </View>
        ) : (
          <ScrollView 
            className="flex-1 px-4 pt-3"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingHorizontal: 16 }}
          >
            {historyItems.map((item) => {
              const status = getStatusStyles(item.result);
              const itemId = item.id;
              return (
                <TouchableOpacity
                  key={itemId}
                  onPress={() => router.push({pathname: `/(drawer)/history/${itemId}` })}
                  className="w-full bg-[#1e2430] border border-slate-800 rounded-xl p-4 mb-3 flex-row justify-between items-center active:bg-slate-800 shadow-sm"
                >
                  {/* Левая часть: Номер и Дата */}
                  <View className="flex-col gap-1 flex-1 pr-3">
                    <Text className="text-lg font-bold text-slate-200 tracking-wide">
                      {item.digits}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <FontAwesome5 name="clock" size={11} color="#5a657c" />
                      <Text className="text-xs font-medium text-slate-500">
                        {formatDate(item.date_time)}
                      </Text>
                    </View>
                  </View>

                  {/* Правая часть: Статус-бейдж и шеврон */}
                  <View className="flex-row items-center gap-3">
                    {item.result && (
                      <View className={`px-2.5 py-1 rounded-md border ${status.container}`}>
                        <Text className={`text-xs font-bold ${status.text}`}>
                          {item.result}
                        </Text>
                      </View>
                    )}
                    <FontAwesome5 name="chevron-right" size={14} color="#5a657c" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Компонент Пагинации */}
      {!isHistoryLoading && historyItems.length > 0 && (
        <PaginatorComponent
          curPage={curPage}
          pageCount={pageCount}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
    </View>
  );
};

export default HistoryPage;