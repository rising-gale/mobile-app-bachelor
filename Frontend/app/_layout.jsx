import React from 'react'
import {Provider} from 'react-redux'
import {combineReducers, configureStore} from '@reduxjs/toolkit'
import { Stack } from 'expo-router'

import assessmentsSlice from '../src/redux/assessmentsSlice'
import usersSlice from '../src/redux/usersSlice'

const rootReducer = combineReducers({
  assessment: assessmentsSlice,
  user: usersSlice
})

const store = configureStore({reducer:rootReducer});

const rootLayout = () => {
  return (
    <Provider store={store}>
        <Stack screenOptions={{headerShown: false}}></Stack>
    </Provider>
  )
}

export default rootLayout