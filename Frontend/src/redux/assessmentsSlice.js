import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import assessmentsRouter from "../routes/assessment-router"
import * as SecureStore from 'expo-secure-store';
// import $api from "../utils/api"

export const checkNumber = createAsyncThunk(
    'post/assessment/check_number',
    async ({formdata}) => {
      try {
        // console.log(formdata)
        const authorization_header = await SecureStore.getItemAsync('access_token');
        const { data } = await axios.post(assessmentsRouter.checkNumberPath(), formdata, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        console.log('Data: ', data);
        if(data.number_info?.message == 'Number doesn`t exist in our DB.')
        {
            let response = await axios.get(`https://baza-gai.com.ua/nomer/${data.number_info.digits}`,{headers:{"Accept": "application/json", "X-Api-Key": 'REDACTED_BAZA_GAI_API_KEY'}})
            console.log('Number info got from External API: ', response.data);
            let res = await axios.post(assessmentsRouter.saveNumberInfoPath(), {information: response.data})
            console.log('Результат сохранения в нашу базу: ', res.data);
            return {number_info: response.data, number_history: []}
        }
        return (data)
      } catch (error) {
        console.log(error)
        return ({ message: 'Номер не було знайдено в жодній базі ...' })
      }
    }
)

export const saveImage = createAsyncThunk(
  'post/assessment/save_image',
  async ({formdata}) => {
    try {
      console.log(formdata)
      const { data } = await axios.post(assessmentsRouter.saveImagePath(), formdata)
      console.log('Data: ', data);
      return (data)
    } catch (error) {
      console.log(error)
      return ({ message: error.response.message })
    }
  }
)

export const getNumberInfo = createAsyncThunk(
  'get/assessment/get_number',
  async ({digits}) => {
    try {
      const { data } = await axios.get(assessmentsRouter.getNumberInfo(), { params:{digits: digits}})
      // console.log('Get number data: ', data);
      return (data)
    } catch (error) {
      console.log(error)
      return ({ message: error.response.message })
    }
  }
)

export const submitAssessment = createAsyncThunk(
    'post/assessment/submit',
    async ({digits, result, comment, location, direction, formdata}) => {
      try {
        // console.log(digits, result, comment, location, direction, formdata)
        const authorization_header = await SecureStore.getItemAsync('access_token');
        const { data } = await axios.post(assessmentsRouter.submitAssessmentPath(), {"digits": digits, "result": result, "comment": comment, "location": location, "direction": direction, 'image': ''}, { headers:{Authorization: authorization_header} })
        // console.log(data.assessment_id);
        let res = await axios.post(assessmentsRouter.saveImagePath(), formdata, {params:{assessment_id: data.assessment_id}})
        // console.log(res.data);
        return (data)
      } catch (error) {
        console.log(error)
        return ({ message: error.response.message })
      }
    }
)

export const getAssessmentByID = createAsyncThunk(
    'get/assessment/get_assessment_by_id',
    async ({assessmentID}) => {
      try {
        const { data } = await axios.get(assessmentsRouter.getAssessmentByID())
        console.log(data);
        return (data)
      } catch (error) {
        console.log(error)
        return ({ message: error.response.message })
      }
    }
)

export const deleteAssessmentByID = createAsyncThunk(
  'get/assessment/delete',
  async ({assessmentID}) => {
    try {
      const { data } = await axios.delete(assessmentsRouter.deleteAssessmentPath(), {params:{assessment_id: assessmentID}})
      console.log(data);
      return (data)
    } catch (error) {
      console.log(error)
      return ({ message: error.response.message })
    }
  }
)

export const getAssessmentHistory = createAsyncThunk(
    'get/assessment/get_history',
    async ({pageNumber}) => {
      try {
        const authorization_header = await SecureStore.getItemAsync('access_token');
        const { data } = await axios.get(assessmentsRouter.getAssessmentHistory(), { headers:{Authorization: authorization_header}, params:{pageNumber: pageNumber} })
        // console.log('Get history data: ', data);
        return (data)
      } catch (error) {
        console.log(error)
        return ({ message: error.response.message })
      }
    }
)

export const getHistoryPageCount = createAsyncThunk(
  'get/assessment/get_page_count',
  async () => {
    try {
      const authorization_header = await SecureStore.getItemAsync('access_token');
      const { data } = await axios.get(assessmentsRouter.getPageCount(), { headers:{Authorization: authorization_header}})
      // console.log('Page count: ', data);
      return (data)
    } catch (error) {
      console.log(error)
      return ({ message: error.response.message })
    }
  }
)

export const getAssessmentHistoryByNumber = createAsyncThunk(
  'get/assessment/get_history_by_digits',
  async ({digits}) => {
    try {
      const { data } = await axios.get(assessmentsRouter.getAssessmentHistoryByDigits(), { params:{digits: digits}})
      return (data)
    } catch (error) {
      console.log(error)
      return ({ message: error.response.message })
    }
  }
)

const assessmentsSlice = createSlice({
    name: 'assessment',
    initialState: {
        history: null,
        historyPageCount: 1,
        history_item_number_info: null,

        assessment_by_id: null,

        last_assessment_image: null,
        last_assessment: null,
        // last_assessment_history: null,

        errMsg: ''
    },
    reducers:{
      clearLastAssessment(state, action) {
        state.last_assessment = null;
        state.last_assessment_image = null;
      },
      clearError(state, action){
        state.errMsg = ''
      },
      setFormData(state,action){
        // console.log(typeof action.payload);
        state.last_assessment_image = action.payload;
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(getAssessmentHistory.fulfilled, (state, action) => {
            state.history = action?.payload;
        })
        .addCase(getAssessmentByID.fulfilled, (state, action) => {
            state.assessment_by_id = action?.payload;
        } )
        .addCase(checkNumber.fulfilled, (state, action) => {
          console.log('fulfilled: ', action.payload);
          if(!action.payload.message)
          {
            state.last_assessment = action?.payload;
          } else state.errMsg = action?.payload.message;
        })
        .addCase(checkNumber.rejected, (state, action) =>
        {
          console.log('rejected')
          state.errMsg = action?.payload.message;
        })
        .addCase(getAssessmentHistoryByNumber.fulfilled, (state, action) => {
          state.last_assessment_history = action?.payload;
        })
        .addCase(getNumberInfo.fulfilled, (state, action) => {
          console.log('fulfilled')
          state.history_item_number_info = action?.payload;
        })
        .addCase(deleteAssessmentByID.fulfilled, (state, action) => {
          if(action.payload?.message != 'Success')
            state.errMsg = action.payload?.message
      })
      .addCase(getHistoryPageCount.fulfilled, (state, action)=>{
        state.historyPageCount = action.payload
      })

    }
})

export default assessmentsSlice.reducer;
export const { clearLastAssessment, clearError, setFormData } = assessmentsSlice.actions;