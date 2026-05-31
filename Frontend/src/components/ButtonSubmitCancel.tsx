import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ButtonSubmitCancelProps {
  submitAction?: () => void;
  cancelAction?: () => void;
  buttonHidden?: 'Submit' | 'Cancel' | 'none';
  buttonSubmitText?: string;
  buttonCancelText?: string;
}

const ButtonSubmitCancel: React.FC<ButtonSubmitCancelProps> = ({
  submitAction,
  cancelAction,
  buttonHidden = 'none',
  buttonSubmitText = 'Продовжити',
  buttonCancelText = 'Скасувати',
}) => {
  const showSubmit = buttonHidden !== 'Submit';
  const showCancel = buttonHidden !== 'Cancel';

  return (
    <View className="w-full flex-row items-center justify-between gap-x-4 mt-4 mb-2">
      {/* Кнопка Cancel (Скасувати) — слева */}
      {showCancel && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-1 h-12 bg-red-600/20 active:bg-red-600/30 border border-red-500/30 rounded-xl justify-center items-center"
          onPress={cancelAction}
        >
          <Text className="text-red-400 text-base font-bold">
            {buttonCancelText}
          </Text>
        </TouchableOpacity>
      )}

      {showSubmit && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-1 h-12 bg-[#9B907B]/80 active:bg-[#867b67] rounded-xl justify-center items-center shadow-md"
          onPress={submitAction}
        >
          <Text className="text-[#181c24] text-base font-bold tracking-wide">
            {buttonSubmitText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ButtonSubmitCancel;