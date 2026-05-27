import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from "@react-navigation/drawer"
import {StatusBar} from 'expo-status-bar'
import React, { useRef } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, Image, _Image, SafeAreaView} from 'react-native'
import {Camera} from 'expo-camera'
import { router } from 'expo-router';
import { useDispatch } from 'react-redux'
import { checkNumber, setFormData } from '../../../src/redux/assessmentsSlice'
import { MaterialIcons, AntDesign  } from '@expo/vector-icons';

const TakePictureScreen = () => {
  
  const dispatch = useDispatch()

  const [startCamera, setStartCamera] = React.useState(false)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [capturedImage, setCapturedImage] = React.useState(null)
  const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back)
  const [flashMode, setFlashMode] = React.useState('off')

  let camera = useRef(new Camera)

  const __startCamera = async () => {
    const {status} = await Camera.requestCameraPermissionsAsync();
    // console.log(status)
    if (status === 'granted') {
      setStartCamera(true)
    } else {
      Alert.alert('Access denied')
    }
  }
  
  const __takePicture = async () => {
    const options = { quality: 0.5, base64: true, imageType: 'jpeg' };
    const photo = await camera.takePictureAsync(options)
    // console.log('pic')
    const formdata = new FormData();

    let filename = photo.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    formdata.append('image', { uri: photo.uri, name: filename, type });
    dispatch(checkNumber({formdata: formdata}));
    dispatch(setFormData({ uri: photo.uri, name: filename, type }));
    // let digits = null;
    router.replace(`/(drawer)/assessment/form`)
    // setPreviewVisible(true)

    setStartCamera(false)

    // setCapturedImage(photo)
  }

  const __savePhoto = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
    __startCamera()
  }

  const __retakePicture = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
    __startCamera()
  }

  const __handleFlashMode = () => {
    if (flashMode === 'on') {
      setFlashMode('off')
    } else if (flashMode === 'off') {
      setFlashMode('on')
    } else {
      setFlashMode('auto')
    }
  }

  const __switchCamera = () => {
    if (cameraType === 'back') {
      setCameraType('front')
    } else {
      setCameraType('back')
    }
  }

  const __turnOffCamera = () => {
    setStartCamera(false)
  }

  return (
    <SafeAreaView style={{flex:1, flexDirection: 'column', backgroundColor: '#181c24'}}>
      <Drawer.Screen options={{headerShown: true, title: 'Нова перевірка', headerStyle:{backgroundColor: '#6D7992' }, headerLeft: () => <DrawerToggleButton tintColor='#080D17'/>}} />
      <View style={{flex: 1}}>
      {startCamera ? (
        <View style={{ flex: 1, width: '100%', height: '100%'}}>
          {previewVisible && capturedImage ? (
            <CameraPreview photo={capturedImage} savePhoto={__savePhoto} retakePicture={__retakePicture} />
          ) : (
            <Camera type={cameraType} flashMode={flashMode} style={{flex: 1}}
              ref={(r) => {
                camera = r
              }}>
              <View style={{ flex: 1,width: '100%',backgroundColor: 'transparent',flexDirection: 'row'}}>
                <View style={{position: 'absolute',left: '0.1%',top: '3%', flexDirection: 'column', justifyContent: 'space-between', padding: 10, alignItems: 'center'}}>
                <TouchableOpacity
                    onPress={__turnOffCamera}
                >
                    <AntDesign name="close" size={38} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={__handleFlashMode}
                    style={{marginTop: 20, padding: 5, alignItems: 'center', justifyContent: 'center'}}>
                    {flashMode === 'off' ? <MaterialIcons name="flash-on" size={38} color="yellow" /> : <MaterialIcons name="flash-off" size={38} color="yellow" />}
                  </TouchableOpacity>
                </View>
                <View style={{position: 'absolute',bottom: 0,flexDirection: 'row',flex: 1,width: '100%',padding: 20,justifyContent: 'space-between'}}>
                  <View style={{ alignSelf: 'center', flex: 1, alignItems: 'center'}}>
                    <TouchableOpacity onPress={__takePicture} style={{ width: 70, height: 70, bottom: 0, borderRadius: 50, backgroundColor: '#fff'}}/>
                  </View>
                </View>
              </View>
            </Camera>
          )}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#181c24',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity
            onPress={__startCamera}
            style={{
              width: 130,
              borderRadius: 4,
              backgroundColor: '#145',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 40
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Take picture
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* <StatusBar style="auto" /> */}
    </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   alignItems: 'center',
  //   justifyContent: 'center'
  // }
})

const CameraPreview = ({photo, retakePicture, savePhoto}) => {
  
  return (
    <View style={{backgroundColor: 'transparent',flex: 1,width: '100%',height: '100%'}}>
      <ImageBackground source={{uri: photo && photo.uri}} style={{ flex: 1 }}>
        <View style={{ flex: 1, flexDirection: 'column', padding: 15, justifyContent: 'flex-end' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={retakePicture}
              style={{
                width: 130,
                height: 40,
                alignItems: 'center',
                borderRadius: 4
              }}>
              <Text style={{ color: '#fff', fontSize: 20 }}>Re-take</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={savePhoto}
              style={{
                width: 130,
                height: 40,
                alignItems: 'center',
                borderRadius: 4
              }}>
              <Text style={{ color: '#fff', fontSize: 20}}>save photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

export default TakePictureScreen

