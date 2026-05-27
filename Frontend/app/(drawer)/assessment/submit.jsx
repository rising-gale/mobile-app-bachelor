import { View, Text, SafeAreaView, ViewBase } from 'react-native'
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Drawer from 'expo-router/drawer';
import AssessmentSubmitForm from '../../../src/components/AssessmentSubmitForm';

const SubmitForm = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#181c24' }}>
        <Drawer.Screen options={{headerShown: true, title: 'Заповніть форму', headerStyle:{backgroundColor: '#6D7992' }, headerTintColor:'#080D17'}} />
        <AssessmentSubmitForm />
      </View>
  )
}

export default SubmitForm