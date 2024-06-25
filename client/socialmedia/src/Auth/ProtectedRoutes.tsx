import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import Login from '@/pages/Login/Login';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '@/redux/slices/authSlice';
interface JwtPayload {
  exp: number;
  userId: string;
  [key: string]: any;
}
const Protected = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    console.log('Protected Routes token:',token);
    if (token && userId) {
      setAccessTokenState(token);
      try {
        const decodedToken = parseJwt(token) as JwtPayload;
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token has expired
          console.log('Token has expired!')
          handleLogout();
        }else {
          dispatch(setAccessToken({ token, userId}));
        }
      } catch (error) {
        // If there's an error decoding the token, handle it by logging out
        console.log('Error decoding token:', error)
        handleLogout();
      }
    } else {
      // No token, redirect to login
      console.log('Navigating to login page')
      navigate('/');
    }
    
  }, [navigate, accessToken]);
  const handleLogout = () => {
    toast('Session Expired! Please login again.');
    Cookies.remove('accessToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    setTimeout(() => {
    navigate('/');
    }, 1000);
  };
  const parseJwt = (token: string): JwtPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };
  return accessToken ? <Outlet/> : <Login/>
}

export default Protected
