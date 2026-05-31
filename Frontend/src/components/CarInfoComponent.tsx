import React from 'react';
import { View, Text } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Используем оригинальный интерфейс из твоего файла api.ts
import { NumberInfoOut } from '../redux/api'; 

interface CarInfoComponentProps {
  info?: NumberInfoOut;
}

const CarInfoComponent: React.FC<CarInfoComponentProps> = ({ info }) => {
  // Безопасно извлекаем первую операцию из массива any[]
  const lastOperation = info?.operations?.[0];

  return (
    <View className="w-full bg-[#14171b] rounded-2xl p-3 border border-slate-900">
      
      {/* КАРТОЧКА СТАТУСА УГОНА */}
      <View 
        className={`flex-row items-center gap-3 p-3.5 rounded-xl border mb-3 ${
          info?.is_stolen 
            ? 'bg-red-500/10 border-red-500/30' 
            : 'bg-emerald-500/5 border-emerald-500/20'
        }`}
      >
        <AntDesign 
          name={info?.is_stolen ? "warning" : "check-circle"} 
          size={22} 
          color={info?.is_stolen ? "#ef4444" : "#10b981"} 
        />
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Перевірка на угон</Text>
          <Text className={`text-base font-bold mt-0.5 ${info?.is_stolen ? 'text-red-400' : 'text-emerald-400'}`}>
            {info?.is_stolen ? 'УВАГА! АВТО В УГОНІ!' : 'Не числиться в угоні'}
          </Text>
          {info?.is_stolen && info?.stolen_details && (
            <Text className="text-xs text-red-400/80 mt-1">{info.stolen_details}</Text>
          )}
        </View>
      </View>

      {/* МАРКА, МОДЕЛЬ, ГОД */}
      <View className="flex-row items-start gap-4 p-3 border-b border-slate-800/40">
        <View className="w-8 items-center pt-0.5">
          <MaterialCommunityIcons name="car-info" size={22} color="#9B907B" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Транспортний засіб</Text>
          <Text className="text-base text-slate-200 font-semibold mt-0.5">
            {info?.vendor || '—'} {info?.model || ''}
          </Text>
          {info?.model_year && (
            <Text className="text-xs text-slate-400 mt-0.5">{info.model_year} року випуску</Text>
          )}
        </View>
      </View>

      {/* VIN-КОД КУЗОВА */}
      <View className="flex-row items-start gap-4 p-3 border-b border-slate-800/40">
        <View className="w-8 items-center pt-0.5">
          <MaterialCommunityIcons name="barcode" size={22} color="#9B907B" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">VIN-код</Text>
          <Text className="text-base text-slate-200 font-mono font-bold mt-0.5 tracking-wider">
            {info?.vin || 'Відсутній в базі'}
          </Text>
        </View>
      </View>

      {/* ДАТА РЕГИСТРАЦИИ */}
      <View className="flex-row items-start gap-4 p-3 border-b border-slate-800/40">
        <View className="w-8 items-center pt-0.5">
          <AntDesign name="calendar" size={20} color="#9B907B" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Остання реєстрація</Text>
          <Text className="text-base text-slate-200 font-medium mt-0.5">
            {lastOperation?.registered_at || 'Дата відсутня'}
          </Text>
        </View>
      </View>

      {/* ВНЕШНИЙ ВИД (Цвет, тип кузова) */}
      <View className="flex-row items-start gap-4 p-3 border-b border-slate-800/40">
        <View className="w-8 items-center pt-0.5">
          <Ionicons name="color-palette-outline" size={20} color="#9B907B" style={{ transform: [{ translateY: -2 }] }} />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Опис та колір</Text>
          <Text className="text-base text-slate-200 font-medium mt-0.5 capitalize">
            {lastOperation?.color?.ua || 'Колір не вказано'}, {lastOperation?.kind?.ua || 'тип невідомий'}
          </Text>
        </View>
      </View>

      {/* ОПЕРАЦИЯ И СЕРВИСНЫЙ ЦЕНТР */}
      <View className="flex-row items-start gap-4 p-3 border-b border-slate-800/40">
        <View className="w-8 items-center pt-0.5">
          <AntDesign name="database" size={20} color="#9B907B" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Реєстраційна дія</Text>
          <Text className="text-base text-slate-200 font-medium mt-0.5">
            {lastOperation?.operation?.ua || 'Дані відсутні'}
          </Text>
          {lastOperation?.department && (
            <Text className="text-xs text-slate-400 mt-1 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              {lastOperation.department}
            </Text>
          )}
        </View>
      </View>

      {/* АДРЕС РЕГИСТРАЦИИ */}
      <View className="flex-row items-start gap-4 p-3">
        <View className="w-8 items-center pt-0.5">
          <AntDesign name="environment" size={20} color="#9B907B" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Адреса реєстрації ТЗ</Text>
          <Text className="text-sm text-slate-300 mt-1 leading-relaxed">
            {lastOperation?.address || 'Адреса відсутня в базі'}
          </Text>
        </View>
      </View>

    </View>
  );
};

export default CarInfoComponent;