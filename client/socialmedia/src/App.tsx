
import './App.css'
import MyRoutes from './MyRoutes'
import { Provider } from 'react-redux';
import store from './redux/store';
function App() {
  return (
    <>
    <Provider store={store}>
    <MyRoutes/>
    </Provider>
    </>
  )
}

export default App
