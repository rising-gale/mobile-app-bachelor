import React from "react";
import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetMeQuery } from "src/redux/api";
import { ActivityIndicator, View, Text } from "react-native";

const DrawerLayout = () => {
  const { data: userData, isLoading, isError } = useGetMeQuery();

  // Загрузка на NativeWind
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#181c24]">
        <ActivityIndicator size="large" color="#9B907B" />
      </View>
    );
  }

  if (isError || !userData?.data?.id) {
    return <Redirect href="/auth" />;
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: false, // ГЛОБАЛЬНО ОТКЛЮЧАЕМ ШАПКУ ДРОВЕРА.
        
        drawerStyle: { backgroundColor: "#1e2430", width: 280 },
        drawerActiveBackgroundColor: "#181c24",
        drawerActiveTintColor: "#9B907B",
        drawerInactiveTintColor: "#94a3b8",
        drawerContentContainerStyle: { flex: 1, justifyContent: "center", paddingVertical: 20 },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: ({ color }) => <Text style={{ color }} className="text-lg font-bold -ml-3">Головна</Text>,
          drawerIcon: ({ size, color }) => <FontAwesome5 name="home" size={size - 2} color={color} />,
        }}
      />

      <Drawer.Screen
        name="assessment"
        options={{
          drawerLabel: ({ color }) => <Text style={{ color }} className="text-lg font-bold -ml-3">Нова перевірка</Text>,
          drawerIcon: ({ size, color }) => <FontAwesome5 name="camera" size={size - 2} color={color} />,
        }}
      />

      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: ({ color }) => <Text style={{ color }} className="text-lg font-bold -ml-3">Історія</Text>,
          drawerIcon: ({ size, color }) => <FontAwesome5 name="history" size={size - 2} color={color} />,
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: ({ color }) => <Text style={{ color }} className="text-lg font-bold -ml-3">Налаштування</Text>,
          drawerIcon: ({ size, color }) => <MaterialCommunityIcons name="account-cog" size={size + 2} color={color} />,
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;