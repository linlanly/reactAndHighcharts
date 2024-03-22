import { createSlice } from "@reduxjs/toolkit";

export interface AboutState {
  counter: number,
  title: string
}

const initialState: AboutState = {
  counter: 0,
  title: 'redux'
}

export const about = createSlice({
  name: 'about',
  initialState,
  reducers: {
    setCounter(state, { payload}) {
      state.counter = payload.counter
    }
  }
})

export const { setCounter } = about.actions
export default about.reducer