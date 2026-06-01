import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface PaginatorComponentProps {
  curPage: number;
  pageCount: number;
  nextPage: () => void;
  prevPage: () => void;
}

const PaginatorComponent: React.FC<PaginatorComponentProps> = ({
  curPage,
  pageCount,
  nextPage,
  prevPage,
}) => {
  const isFirstPage = curPage <= 1;
  const isLastPage = curPage >= pageCount;

  return (
    <View className="flex-row justify-between items-center p-6 border-t border-slate-800/80 bg-[#181c24]">
      {/* Кнопка НАЗАД */}
      <TouchableOpacity
        onPress={prevPage}
        disabled={isFirstPage}
        className={`p-2.5 rounded-xl bg-[#1e2430] border border-slate-800/50 active:bg-slate-800 ${
          isFirstPage ? 'opacity-30' : 'opacity-100'
        }`}
      >
        <AntDesign name="left" size={24} color="#9B907B" />
      </TouchableOpacity>

      {/* Текст страниц */}
      <View className="bg-[#1e2430] px-5 py-2 rounded-xl border border-slate-800/50">
        <Text className="text-xl font-bold text-[#9B907B] tracking-wider">
          {curPage} <Text className="text-slate-500 text-sm">/</Text> {pageCount || 1}
        </Text>
      </View>

      {/* Кнопка ВПЕРЕД */}
      <TouchableOpacity
        onPress={nextPage}
        disabled={isLastPage}
        className={`p-2.5 rounded-xl bg-[#1e2430] border border-slate-800/50 active:bg-slate-800 ${
          isLastPage ? 'opacity-30' : 'opacity-100'
        }`}
      >
        <AntDesign name="right" size={24} color="#9B907B" />
      </TouchableOpacity>
    </View>
  );
};

export default PaginatorComponent;