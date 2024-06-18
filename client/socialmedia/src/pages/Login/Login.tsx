import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Form, FormField } from "@/components/ui/form";
import API_BASE_URL from '../../config';
import connectblack from '../../../public/images/connecblack.png';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();

  const handleLogin: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: data.email,
        password: data.password,
      });

      if (response.data) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        Cookies.set('accessToken', accessToken, { expires: 1 });
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('User_data', JSON.stringify(response.data.user));

        toast.success('Login successful!');
        setShowLoginSuccess(true);
        setTimeout(() => {
          setShowLoginSuccess(false);
          navigate('/home');
        }, 1000);
      } else {
        toast.error('Login failed! Please check your credentials.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || 'Login failed! Please check your credentials.');
      } else {
        toast.error('Login failed! Please try again later.');
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem('accessToken');
    if (authToken) {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen">
      <div className="p-10 bg-gray-200 bg-opacity-80 rounded-md shadow-md relative z-10 flex items-center space-x-10">
        <img src={connectblack} alt="Logo" className="h-48 w-48" />
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6 w-[400px]">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Input placeholder="Email" {...field} className='w-full' />
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Input type="password" placeholder="Password" {...field} className='w-full' />
                )}
              />
              <div className="flex justify-center">
                <Button type="submit" className='w-full'>Login</Button>
              </div>
            </form>
          </Form>
          <div className="flex justify-between">
            <div className="text-center mt-4">
              <a href="/register" className="text-black hover:underline">Register?</a>
            </div>
            <div className="text-center mt-4">
              <a href="/resetpassword" className="text-black hover:underline">Forgot Password?</a>
            </div>
          </div>
          <Toaster />
        </div>
      </div>
    </div>
  );
};

export default Login;
