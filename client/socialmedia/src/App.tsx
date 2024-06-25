
import './App.css'
import MyRoutes from './MyRoutes'
import { Provider } from 'react-redux';
import store from './redux/store';
// import { useEffect } from 'react';
// import socket from './socket';
function App() {
  // useEffect(()=>{
  //   socket.on('connect', () => {
  //     console.log("Connected to socket.io server");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  return (
    <>
    <Provider store={store}>
    <MyRoutes/>
    </Provider>
    </>
  )
}

export default App
