import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


// import * as React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import ProfileScreen from './src/ProfileScreen';
// import HomeScreen from './src/HomeScreen';
// import CheckInfo from './src/CheckInfo';
// import HistoryScreen from './src/HistoryScreen';
// import CameraScreen from './src/CameraScreen';
// import HistoryItemResult from './src/components/HistoryItemResult';
// import AuthScreen from './src/AuthScreen';

// const Stack = createNativeStackNavigator();
// const isAuth = false

// export default function App() {

//   return (
//     <NavigationContainer>
//       {!isAuth ? <Stack.Navigator>
//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//         // options={{ title: 'EAutoCheckSystem' }}
//         />
//         <Stack.Screen name="Profile" component={ProfileScreen} />
//         <Stack.Screen name="History item" component={HistoryItemResult} />
//         <Stack.Screen name="Take Picture" component={CameraScreen} />
//         <Stack.Screen name="CheckInfo" component={CheckInfo} />
//         <Stack.Screen name="History" component={HistoryScreen} />
//       </Stack.Navigator> :
//         <Stack.Navigator>
//           <Stack.Screen
//             name="Home"
//             component={AuthScreen}
//           // options={{ title: 'EAutoCheckSystem' }}
//           />
//         </Stack.Navigator>}

//     </NavigationContainer>
//   )
// }