import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './App.css'
import Routes from "@/router/beforeEach.tsx"
import store from "@/store/index.ts"
import { Provider } from "react-redux"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes />      
    </BrowserRouter>
  </Provider>,
)
