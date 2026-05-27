import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons, Fontisto } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAssessmentByID, getNumberInfo } from '../../../src/redux/assessmentsSlice';
import CarInfoComponent from '../../../src/components/CarInfoComponent';
import ButtonSubmitCancel from '../../../src/components/ButtonSubmitCancel';
 
const History_Item = () => {
  const assessmentInfo = useLocalSearchParams();
  const dispatch = useDispatch();
  const [carInfoVisible, setCarInfoVisible] = useState(false);
  const number_info = useSelector(state => state.assessment.history_item_number_info)
  //Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  useEffect(() => {
    // Запрос на инфу о машине
    if(assessmentInfo.digits)
      dispatch(getNumberInfo({ digits: assessmentInfo.digits }))
  }, [assessmentInfo]);

  // console.log(assessmentInfo)
  let date = new Date(assessmentInfo.date_time)
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes();
  date = `${day}-${month}-${year} ${hour}:${minutes}`;
  console.log(assessmentInfo)
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: assessmentInfo.digits, headerStyle:{backgroundColor: '#6D7992'}, headerTintColor: '#080D17'}}/>
      <ScrollView style={styles.scrollView}>
        <View style={styles.pictureContainer}>
          <Image style={styles.image} resizeMode='contain' source={{ uri: assessmentInfo?.image?.length <= 0 || !assessmentInfo?.image ? 'https://baza-gai.com.ua/catalog-images/lamborghini/huracan/model.jpg' : `http://192.168.0.107:8080/image/${assessmentInfo.image}`}} />
        </View>
        <View style={styles.assessmentContainer}>
          <View style={styles.directionContainer}>
            <View style={styles.directionItemContainer}>
              <MaterialCommunityIcons name="location-exit" size={30} color="red" />
              <Text style={styles.itemText}>{assessmentInfo.location}</Text>
            </View>
            <FontAwesome name="long-arrow-right" size={30} color="yellow"/>
            <View style={styles.directionItemContainer}>
              <MaterialCommunityIcons name="location-enter" size={30} color="green" />
              <Text style={styles.itemText}>{assessmentInfo.direction}</Text>
            </View>
          </View>
          <View style={styles.itemRowContainer}>
            <View style={styles.leftRowContainer}>
              {assessmentInfo.result == 'OK' ? <Ionicons name="checkmark-done-sharp" size={30} color="green" /> : <MaterialCommunityIcons name="cancel" size={30} color="red" />}
            </View>
            <View style={styles.rightRowContainer}>
              <Text style={styles.rightRowTitle}>Результат перевірки:</Text>
              <Text style={styles.rightRowText}>{assessmentInfo.result}</Text>
            </View>
          </View>
          <View style={styles.itemRowContainer}>
            <View style={styles.leftRowContainer}>
              <MaterialCommunityIcons name="comment-alert-outline" size={30} color="yellow" />
            </View>
            <View style={styles.rightRowContainer}>
              <Text style={styles.rightRowTitle}>Коментар перевіряючого:</Text>
              <Text style={styles.rightRowTextBig}>{assessmentInfo.comment}</Text>
            </View>
          </View>
          <View style={styles.itemRowContainer}>
            <View style={styles.leftRowContainer}>
              <Fontisto name="date" size={30} color="purple" />
            </View>
            <View style={styles.rightRowContainer}>
              <Text style={styles.rightRowTitle}>Дата та час перевірки:</Text>
              <Text style={styles.rightRowText}>{date}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity  style={styles.dropdownContainer} onPress={()=>{carInfoVisible ? setCarInfoVisible(false) : setCarInfoVisible(true)}}>
          <Text style={styles.itemTextTitle}>Інформація по номеру:</Text>
          {carInfoVisible ? <AntDesign name="up" size={35} color="gray" /> : <AntDesign name="down" size={35} color="gray" />}
        </TouchableOpacity>

        { carInfoVisible ?  
        <CarInfoComponent info={number_info?.number_info}/>
        : <></>
        }
        <ButtonSubmitCancel cancelAction={()=>{dispatch(deleteAssessmentByID({assessmentID: assessmentInfo._id})); router.replace('/history/status')}} buttonHidden={'Submit'} buttonCancelText={'Видалити'}/>
      </ScrollView>
    </SafeAreaView>

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
  // -----------------------------------------
  assessmentContainer:{
    borderWidth:2,
    borderRadius: 5,
    borderColor: '#6D7992',
    flex: 1,
    padding: 10,
    backgroundColor: '#14171B'
  },
  directionContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignContent: 'center',
    padding: 10
  },
  directionItemContainer:{
    flex: 3,
    alignItems: 'center'
  },
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
  // -----------------------------------------
  pictureContainer: {
    flex: 1,
    // backgroundColor: 'gray',
    padding: 10,
    marginBottom: 10
  },
  image: {
    borderRadius: 15,
    width: '100%',
    height: 400,
  },
  // -----------------------------------------
  itemTextTitle: {
    fontSize: 25,
    color: 'gray',
    fontWeight: 'bold',
    paddingLeft: 5
  },
  itemText: {
    fontSize: 25,
    color: 'gray',
    textAlign: 'center',
    padding: 3
  },
  //---------------------------------------------
  itemRowContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 0,
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
    flex: 6,
    padding: 5,
  },
  rightRowTitle: {
    fontSize: 22,
    color: 'gray',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  rightRowText: {
    fontSize: 20,
    color: 'gray',
    padding: 4,
    textAlign: 'center'
  },
  rightRowTextBig: {
    fontSize: 16,
    color: 'gray',
    padding: 5,
    textAlign: 'justify'
},
  //---------------------------------------------
})

export default History_Item