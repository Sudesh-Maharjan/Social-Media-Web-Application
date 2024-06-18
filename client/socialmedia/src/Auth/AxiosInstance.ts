
// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000/api/v1',
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (refreshToken) {
//         try {
//           const { data } = await axios.post('baseURL/users/refresh-token', { token: refreshToken });
//           localStorage.setItem('accessToken', data.accessToken);
//           axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
//           return axiosInstance(originalRequest);
//         } catch (err) {
//           console.error('Refresh token failed', err);
//           // Handle logout or token refresh failure here
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;