import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, StatusBar, ActivityIndicator, Button } from 'react-native'
// import { useLocalSearchParams } from 'expo-router';
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from "@react-navigation/drawer"
import { AntDesign } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import AssessmentHistory from '../../../src/components/AssessmentHistory';
import CarInfoComponent from '../../../src/components/CarInfoComponent';
import { router } from 'expo-router';
import ButtonSubmitCancel from '../../../src/components/ButtonSubmitCancel';
import { clearLastAssessment } from '../../../src/redux/assessmentsSlice';


const AssessmentPage = () => {
  // const { digits } = useLocalSearchParams();
  const info = useSelector(state => state.assessment.last_assessment)
  const [historyVisible, setHistoryVisible] = useState(false);
  const dispatch = useDispatch();

  const err = useSelector(state => state.assessment.errMsg);
  
  useEffect(() => {
    if(err?.length > 0)
    {
      router.replace('/assessment/status')
    }
  }, [err]);


  return (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
      <Drawer.Screen options={{ headerShown: true, title: `Перевірка даних`, headerStyle:{backgroundColor: '#6D7992' }, headerLeft: () => <DrawerToggleButton tintColor='#080D17'/> }} />
      <SafeAreaView style={styles.container}>
        {info ?
          <ScrollView style={styles.scrollView}>
            <Text style={styles.boldTitleText}>{info.number_info.digits}</Text>
            <View style={styles.pictureContainer}>
              <Image style={styles.image} source={{ uri: info.number_info.photo_url }} />
            </View>
            <View style={styles.vinContainer}>
              <Text style={styles.vinText}>VIN:</Text>
              <Text style={styles.vinTextContent}> {info.number_info.vin ? info.number_info.vin : 'Інформація відсутня.'} </Text>
            </View>

            {info && <CarInfoComponent info={info?.number_info}/> }

            <TouchableOpacity style={styles.dropdownContainer} onPress={()=>{historyVisible ? setHistoryVisible(false) : setHistoryVisible(true)}}>
              <Text style={styles.boldTitleText}>Історія перевірок</Text>
              {historyVisible ? <AntDesign name="up" size={35} color="gray" /> : <AntDesign name="down" size={35} color="gray" />}
            </TouchableOpacity>
            {
            historyVisible ? 
            <AssessmentHistory history={info?.number_history}/>
            : <></>
            } 
            <ButtonSubmitCancel submitAction={()=>{router.push('/assessment/submit')}} cancelAction={()=>{ dispatch(clearLastAssessment()); router.replace('/assessment')}}/>
          </ScrollView>
          : 
          <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#FF9C00" />
          </View>}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#181c24',
  },
  scrollView: {
    backgroundColor: '#181c24',
    padding: 15,
  },
  //---------------------------------------------
  pictureContainer: {
    flex: 1,
    // backgroundColor: 'gray',
    padding: 10,
    marginBottom: 10
  },
  image: {
    borderRadius: 15,
    width: '100%',
    height: 200,
  },
  //---------------------------------------------
  boldTitleText: {
    fontSize: 26,
    color: '#9ba1a7',
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'center'
  },
  //---------------------------------------------
  vinContainer: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    borderColor: '#9ba1a7',
    backgroundColor: '#181c24',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 5
  },
  vinText: {
    fontSize: 20,
    color: 'gray',
    fontWeight: 'bold'
  },
  vinTextContent: {
    fontSize: 20,
    color: 'gray',
  },
  //---------------------------------------------
  itemRowContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-around',
    marginBottom: 10
  },
  leftRowContainer: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightRowContainer: {
    flex: 5,
    padding: 5,
  },
  rightRowTitle: {
    fontSize: 25,
    color: 'gray',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  rightRowText: {
    fontSize: 20,
    color: 'gray',
    padding: 5,
    // textAlign: 'center'
  },
  //---------------------------------------------
  dropdownContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 15,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'beige'
  },

})

export default AssessmentPage