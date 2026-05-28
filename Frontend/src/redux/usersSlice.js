import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import assessmentsRouter from "../routes/users-router"
import * as SecureStore from 'expo-secure-store';
// import $api from "../utils/api"


export const getUserData = createAsyncThunk(
    'get/user/me',
    async () => {
      try {
        // console.log('getuser');
        let authorization_header = await SecureStore.getItemAsync('access_token');
        // console.log(Aheader)
        const { data:responseUserData } = await axios.get(assessmentsRouter.getMePath(), { headers:{Authorization: authorization_header} })
        console.log('responseUserData: ', responseUserData.data);
        return (responseUserData.data)
      } catch (error) {
        console.log(error)
        return ({ message: error.response.message })
      }
    }
)

export const login = createAsyncThunk(
    'post/user/login',
    async ({username, password}, {dispatch}) => {
      try {
        // console.log(username, password);
        let formdata = new FormData();
        formdata.append("username", username)
        formdata.append("password", password)
        // console.log(formdata);
        const { data } = await axios.post(assessmentsRouter.loginPath(), formdata, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        // console.log('Login data:', data);
        // await SecureStore.deleteItemAsync('access_token')
        await SecureStore.setItemAsync('access_token', 'Bearer ' + data.access_token);
        dispatch(getUserData())
        return (data)
      } catch (error) {
        console.log(error)
        return ({ message: error.response.message })
      }
    }
)

export const register = createAsyncThunk(
    'post/user/register',
    async ({username, name, surname, email, password, workLocation}) => {
      try {
        const { data } = await axios.post(assessmentsRouter.registerPath(), {"username": username, "name": name, "surname": surname, "email": email, "password": password, "workLocation": workLocation}, { withCredentials: true })
        console.log(data);
        return (data)
      } catch (error) {
        console.log(error)
        return ({ message: 'Помилка реєстрації...' })
      }
    }
)

export const update_user = createAsyncThunk(
  'post/user/update',
  async ({username, name, surname, email, workLocation},{dispatch}) => {
    try {
      const { data } = await axios.patch(assessmentsRouter.updateUserPath(), {"username": username, "name": name, "surname": surname, "email": email, "password": 'nothin',"workLocation": workLocation}, { withCredentials: true })
      console.log(data);
      dispatch(getUserData());
      return (data)
    } catch (error) {
      console.log(error)
      return ({ message: 'Помилка реєстрації...' })
    }
  }
)

const usersSlice = createSlice({
    name: 'user',
    initialState: {
        userID: null,
        username: '',
        name: '',
        surname: '',
        email: '',
        role: 'operator',
        workLocation: '',
        err: ''
    },
    reducers:{
      clearErr(state, action){
        state.err = ''
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(getUserData.fulfilled, (state, action) => {
            console.log('payload:', action.payload);
            state.userID = action.payload._id;
            state.username = action.payload.username;
            state.name = action.payload.name;
            state.surname = action.payload.surname;
            state.email = action.payload.email;
            state.workLocation = action.payload?.workLocation
            state.role = action.payload?.role
        })
        .addCase(register.fulfilled, (state, action) => {
          if(action.payload.message != 'Success')
            state.err = action.payload.message
      })
    }
})

export default usersSlice.reducer;
export const { clearErr } = usersSlice.actions;