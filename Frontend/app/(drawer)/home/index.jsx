import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from "@react-navigation/drawer"
import { router } from 'expo-router';

import { AntDesign } from '@expo/vector-icons';


const HomePage = () => {

  const images = [
    require('../../../assets/image1.png'),
    require('../../../assets/image2.jpg'),
    require('../../../assets/image3.jpeg'),
  ];

  const imagesAssessment = [
    require('../../../assets/assessment/1.png'),
    require('../../../assets/assessment/2.jpg'),
    require('../../../assets/assessment/3.png'),
    require('../../../assets/assessment/4.png')
  ]

  const imagesHistory = [
    require('../../../assets/history/1.png'),
    require('../../../assets/history/2.png'),
  ]

  const imagesProfile = [
    require('../../../assets/profile/1.png'),
    require('../../../assets/profile/2.png'),
  ]

  const [instructionsOpened, changeInstructionsOpen] = useState({
    assessmentPartOpened: false,
    historyPartOpened: false,
    profilePartOpened: false
  });

  return (
    <SafeAreaView style={styles.container}>
      <Drawer.Screen options={{ headerShown: true, title: 'Доброго дня!', headerStyle: { backgroundColor: '#6D7992' }, headerLeft: () => <DrawerToggleButton tintColor='#080D17' /> }} />
      <ScrollView style={styles.innerContainer} contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.title}>Інструкція, щодо користування застосунком надана нижче: </Text>
        {/* <View style={{ flex: 1 }}> */}
        <Carousel
          style={styles.carousel}
          data={images}
          width={400}
          height={300}
          loop
          autoPlay
          autoPlayInterval={3000}
          scrollAnimationDuration={1500}
          mode="parallax"
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image source={item} style={styles.image} resizeMode="cover" />
            </View>
          )}
        />
        {/* </View> */}
        <TouchableOpacity style={styles.dropdownContainer} onPress={() => {
          changeInstructionsOpen((prev) => ({
            ...prev,
            assessmentPartOpened: !instructionsOpened.assessmentPartOpened
          }))
        }}>
          <Text style={styles.boldTitleText}>Нова перевірка</Text>
          {instructionsOpened.assessmentPartOpened ? <AntDesign name="up" size={35} color="gray" /> : <AntDesign name="down" size={35} color="gray" />}
        </TouchableOpacity>
        {
          instructionsOpened.assessmentPartOpened &&
          <>
            <View>
              <Carousel
                style={styles.carousel}
                data={imagesAssessment}
                width={600}
                height={500}
                loop
                autoPlay
                autoPlayInterval={3000}
                scrollAnimationDuration={1500}
                mode="parallax"
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image source={item} style={styles.image} resizeMode="contain" />
                  </View>
                )}
              />
            </View>
            <Text style={{ padding: 15, fontSize: 20, color: '#9ba1a7', textAlign: 'justify' }}>
              {
                `1.Перейдіть до розділу "Нова перевірка" в меню;\n2.Натисніть кнопку "Зробити фото";\n3.Зробіть фотографію натиснувши круглу кнопку;\n4.Перевірте знайдені дані про т/з;\n5.Натисніть кнопку "Продовжити" та заповніть форму для збереження перевірки чи натисніть "Відмінити".\nНова перевірка з'явиться в розділі "Історія" в меню.`
              }
            </Text>
          </>
        }
        <TouchableOpacity style={styles.dropdownContainer} onPress={() => {
          changeInstructionsOpen((prev) => ({
            ...prev,
            historyPartOpened: !instructionsOpened.historyPartOpened
          }))
        }}>
          <Text style={styles.boldTitleText}>Історія перевірок</Text>
          {instructionsOpened.historyPartOpened ? <AntDesign name="up" size={35} color="gray" /> : <AntDesign name="down" size={35} color="gray" />}
        </TouchableOpacity>
        {
          instructionsOpened.historyPartOpened &&
          <>
            <View>
              <Carousel
                style={styles.carousel}
                data={imagesHistory}
                width={600}
                height={500}
                loop
                autoPlay
                autoPlayInterval={3000}
                scrollAnimationDuration={1500}
                mode="parallax"
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image source={item} style={styles.image} resizeMode="contain" />
                  </View>
                )}
              />
            </View>
            <Text style={{ padding: 15, fontSize: 20, color: '#9ba1a7', textAlign: 'justify' }}>
              {
                `1.Перейдіть до розділу "Історія" в меню;\n2.Для перегляду будь-якої історії просто натисніть на неї;\n3.Внизу сторніки можна видалити цю перевірку;\n`
              }
            </Text>
          </>

        }
        <TouchableOpacity style={styles.dropdownContainer} onPress={() => {
          changeInstructionsOpen((prev) => ({
            ...prev,
            profilePartOpened: !instructionsOpened.profilePartOpened
          }))
        }}>
          <Text style={styles.boldTitleText}>Профіль користувача</Text>
          {instructionsOpened.profilePartOpened ? <AntDesign name="up" size={35} color="gray" /> : <AntDesign name="down" size={35} color="gray" />}
        </TouchableOpacity>
        {
          instructionsOpened.profilePartOpened &&
          <>
            <View>
              <Carousel
                style={styles.carousel}
                data={imagesProfile}
                width={600}
                height={500}
                loop
                autoPlay
                autoPlayInterval={3000}
                scrollAnimationDuration={1500}
                mode="parallax"
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image source={item} style={styles.image} resizeMode="contain" />
                  </View>
                )}
              />
            </View>
            <Text style={{ padding: 15, fontSize: 20, color: '#9ba1a7', textAlign: 'justify' }}>
              {
                `1.Перейдіть до розділу "Налаштування" в меню;\n2.Для редагування профілю натисніть кнопку "Редагувати";\n3.Для збереження або відміни змін натисніть відповідні кнопки;\n4.Для того, щоб вийти з аккаунта натисніть кнопку "Вийти"`
              }
            </Text>
          </>
        }
      </ScrollView>
      <View>
      </View>
      {/* <Button onPress={() => { SecureStore.deleteItemAsync('access_token'); router.replace('/') }} title='Logout' /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#181c24',
    width: '100%',
    height: '100%'
  },
  innerContainer: {
    // borderWidth: 2,
    flex: 1,
    // alignItems: 'center'
  },
  title: {
    fontSize: 24,
    paddingTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#9ba1a7'
  },
  text: {
    fontSize: 25,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#9ba1a7'
  },
  carousel: {
    // flex: 1,
    // width: 300,
    marginBottom: 5,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dropdownContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 12,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'beige',
    width: '95%'
  },
  boldTitleText: {
    fontSize: 26,
    color: '#9ba1a7',
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'center'
  },
});

export default HomePage;