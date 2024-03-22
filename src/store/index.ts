import { configureStore } from "@reduxjs/toolkit";
import * as reducers from "./module.ts";


const store = configureStore({
  reducer: {
    ...reducers
  }
})

export default store;