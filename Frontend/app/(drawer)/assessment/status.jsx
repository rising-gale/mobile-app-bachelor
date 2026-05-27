import { router } from 'expo-router';
// AnimatedCheckmarkScreen.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Svg, { Path } from 'react-native-svg';
import Emoji from 'react-native-emoji';
import Drawer from 'expo-router/drawer';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../../../src/redux/assessmentsSlice';

const AnimatedCheckmarkScreen = () => {
  const dispatch = useDispatch();

  const err = useSelector(state => state.assessment.errMsg);

  console.log('Err:', err)

  const emojiName = err?.length == 0 ? 'grinning' : 'confused';
  const emojiSize = 100;

  const checkmarkRef = useRef(null);

  useEffect(() => {
    // Запускаем анимацию появления при монтировании компонента
    checkmarkRef.current.zoomIn(1000);

    // Устанавливаем таймер для запуска анимации исчезновения через 3 секунд
    const timeout = setTimeout(() => {
      checkmarkRef.current.zoomOut(1000);
      const timeout2 = setTimeout(()=>{
        router.replace('/');
        dispatch(clearError());
      }, 1000)
    }, 3000);

    // Очищаем таймер при размонтировании компонента
    return () => {clearTimeout(timeout);}
  }, []);

  return (
    <View style={styles.container}>
      <Drawer.Screen options={{headerShown: false }}/>
      <Animatable.View ref={checkmarkRef} useNativeDriver>
        {err?.length == 0 ? (
          <Svg width={emojiSize} height={emojiSize} viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M2 12L9 19 22 5"></Path>
          </Svg>
        ) : (
          <View style={styles.errorContainer}>
          <Emoji name={emojiName} style={{ fontSize: emojiSize - 40 }} />
          <Text style={styles.textError}>{err}</Text>
          </View>
        )}
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181c24'
  },
  checkmarkContainer: {
    // Без стилей фона
  },
  errorContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },  
  textError:{
    fontSize: 28,
    fontWeight: 'bold',
    color:'red',
    padding: 10,
    textAlign: 'center'
  }
});

export default AnimatedCheckmarkScreen;
