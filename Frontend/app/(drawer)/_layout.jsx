import { Drawer } from 'expo-router/drawer'
import {Redirect} from 'expo-router'
import { useSelector } from 'react-redux';
import { FontAwesome5, MaterialCommunityIcons   } from '@expo/vector-icons';

const DrawerLayout = () => {
  const user = useSelector(state => state.user);
  if(!user.username) return(<Redirect href="/auth" />)
  //drawerActiveBackgroundColor:'#181C24', drawerActiveTintColor: '#9B907B', drawerInactiveTintColor: 'black'
  return (
    <Drawer screenOptions={{headerShown: false, drawerStyle:{backgroundColor: '#6D7992'}, drawerActiveBackgroundColor:'#181C24', drawerActiveTintColor: '#9B907B', drawerInactiveTintColor: 'black', drawerContentContainerStyle:{flex: 1, justifyContent: 'center'}}}>
        <Drawer.Screen
        name='home'
        options={{
            drawerLabel: "Головна",
            drawerIcon:(({size, color})=>{return (<FontAwesome5 name="home" size={size} color={color} />)}),
            drawerLabelStyle:{fontSize: 20, textAlign: 'center', fontWeight: 'bold'}
        }} ></Drawer.Screen>
        <Drawer.Screen
        name='assessment'
        options={{
            drawerLabel: "Нова перевірка",
            drawerIcon:(({size, color})=>{return (<FontAwesome5 name="camera" size={size} color={color} />)}),
            drawerLabelStyle:{fontSize: 20, textAlign: 'center', fontWeight: 'bold'}
        }}></Drawer.Screen>
        <Drawer.Screen
        name='history'
        options={{
            drawerLabel: "Історія",
            drawerIcon:(({size, color})=>{return (<FontAwesome5 name="history" size={size} color={color} />)}),
            drawerLabelStyle:{fontSize: 20, textAlign: 'center', fontWeight: 'bold'}
        }}></Drawer.Screen>
        <Drawer.Screen
        name='profile'
        options={{
            drawerLabel: "Налаштування",
            drawerIcon:(({size, color})=>{return (<MaterialCommunityIcons name="account-cog" size={31} color={color} />)}),
            drawerLabelStyle:{fontSize: 20, textAlign: 'center', fontWeight: 'bold'}
        }}></Drawer.Screen>
    </Drawer>
  )
}

export default DrawerLayout