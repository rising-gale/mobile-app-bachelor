import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, TouchableOpacity, Text } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraType } from 'expo-camera';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  // const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) console.log('no perm');

  // if (!permission.granted) ... 

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flex: 1 }}>
        <Camera style={{flex: 1}} type={type}>
          {/* <View >
            <TouchableOpacity onPress={toggleCameraType} style={{
              marginTop: 20,
              borderRadius: '50%',
              height: 25,
              width: 25
            }}>
              <Text >Flip Camera</Text>
            </TouchableOpacity>
          </View> */}
        </Camera>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button title="Pick an image from camera roll" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
    </View>

  );
}

// const styles = StyleSheet.create({ 

//  }); 
