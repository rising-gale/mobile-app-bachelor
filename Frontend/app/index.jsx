import React, { useEffect } from 'react'
import {Redirect} from 'expo-router'
import useAuth from '../src/hooks/useAuth';
import { useSelector } from 'react-redux';

export default function Page() {
  useAuth();
  const user = useSelector(state => state.user);
  console.log('UserState: ', user)
  return(
    <>
      {user.username ? <Redirect href={"/(drawer)/home"} /> : <Redirect href="/auth" /> }
    </>
  )
}