import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetMeQuery } from "src/redux/api";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const DrawerLayout = () => {
  // Запускаем проверку профиля. RTK Query автоматически возьмет токен из SecureStore
  const { data: userData, isLoading, isError, isSuccess } = useGetMeQuery();

  // 1. Состояние загрузки: пока бэкенд отвечает, не рендерим экраны, чтобы избежать «мигания» интерфейса
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  // 2. Если бэкенд вернул ошибку (например, 401 Unauthorized) или в данных нет ID пользователя
  if (isError || !userData?.data?.id) {
    return <Redirect href="/auth" />;
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: "#6D7992" },
        drawerActiveBackgroundColor: "#181C24",
        drawerActiveTintColor: "#9B907B",
        drawerInactiveTintColor: "black",
        drawerContentContainerStyle: { flex: 1, justifyContent: "center" },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: "Головна",
          drawerIcon: ({ size, color }) => {
            return <FontAwesome5 name="home" size={size} color={color} />;
          },
          drawerLabelStyle: {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
          },
        }}
      ></Drawer.Screen>
      <Drawer.Screen
        name="assessment"
        options={{
          drawerLabel: "Нова перевірка",
          drawerIcon: ({ size, color }) => {
            return <FontAwesome5 name="camera" size={size} color={color} />;
          },
          drawerLabelStyle: {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
          },
        }}
      ></Drawer.Screen>
      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: "Історія",
          drawerIcon: ({ size, color }) => {
            return <FontAwesome5 name="history" size={size} color={color} />;
          },
          drawerLabelStyle: {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
          },
        }}
      ></Drawer.Screen>
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: "Налаштування",
          drawerIcon: ({ size, color }) => {
            return (
              <MaterialCommunityIcons
                name="account-cog"
                size={31}
                color={color}
              />
            );
          },
          drawerLabelStyle: {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
          },
        }}
      ></Drawer.Screen>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

export default DrawerLayout;

