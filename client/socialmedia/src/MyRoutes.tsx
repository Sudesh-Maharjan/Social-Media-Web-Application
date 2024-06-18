// import React from 'react'
import { BrowserRouter as Router,Route, Routes } from "react-router-dom";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Protected from "./Auth/ProtectedRoutes";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
const MyRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/" element={<Login />} />
        <Route element={<Protected />}>
          <Route
            path="/home"
            element={
                <Home />
            }
          />
         
        </Route>
      </Routes>
    </Router>
  );
};

export default MyRoutes;
