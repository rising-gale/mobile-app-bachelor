import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Описываем структуру элемента списка
export interface DropdownItem {
  label: string;
  value: string;
}

// Описываем пропсы компонента
interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: DropdownItem[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

const DropdownModal: React.FC<DropdownModalProps> = ({
  visible,
  onClose,
  title = 'Оберіть варіант',
  items,
  selectedValue,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        className="flex-1 bg-black/70 justify-center items-center px-6"
      >
        <View className="w-full max-w-sm bg-[#1e2430] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Шапка модалки */}
          <View className="bg-[#252d3d] px-4 py-3 border-b border-slate-800 flex-row justify-between items-center">
            <Text className="text-[#9B907B] text-base font-bold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={14} color="#9B907B" />
            </TouchableOpacity>
          </View>
          
          {/* Список элементов */}
          <ScrollView className="max-h-60 p-2" nestedScrollEnabled={true}>
            {items.map((item, index) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  key={item.value || index}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-xl mb-1 flex-row justify-between items-center ${
                    isSelected ? 'bg-[#9B907B]/10' : 'active:bg-slate-800'
                  }`}
                >
                  <Text className={`text-sm font-medium ${isSelected ? 'text-[#9B907B]' : 'text-slate-300'}`}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <FontAwesome5 name="check" size={12} color="#9B907B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default DropdownModal;