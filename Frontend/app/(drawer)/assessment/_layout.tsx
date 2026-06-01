import { DrawerToggleButton } from "@react-navigation/drawer";
import { Stack } from "expo-router";
import { sharedStackOptions } from "src/config/theme";

const AssessmentLayout = () => {
  return (
    <Stack screenOptions={sharedStackOptions}>
      {/* Страница камеры */}
      <Stack.Screen
        name="index"
        options={{
          title: "Нова перевірка",
          headerLeft: () => <DrawerToggleButton tintColor="#9B907B" />, // Бургер меню
        }}
      />
      {/* Страница информации о номерном знаке */}
      <Stack.Screen
        name="[numberplate]"
        options={{
          title: "Перевірте дані",
        }}
      />
      {/* Страница формы.*/}
      <Stack.Screen
        name="form"
        options={{
          title: "Оформлення інспекції",
        }}
      />
    </Stack>
  );
};

export default AssessmentLayout;
