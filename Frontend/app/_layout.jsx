import "../global.css";
import React from 'react'
import { Provider } from 'react-redux'
import { Stack } from 'expo-router'
import { store } from '../src/redux/store'

const rootLayout = () => {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  )
}

export default rootLayout