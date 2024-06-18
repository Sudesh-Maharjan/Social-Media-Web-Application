import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { ZodIssue } from 'zod';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormField,
} from "@/components/ui/form";
import API_BASE_URL from "../../config";
import connectblack from '../../../public/images/connecblack.png'


const emailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});


type EmailFormData = {email: string};
type OtpFormData = {email: string; password: string; otp: string; firstName: string; lastName: string};
type FormData = EmailFormData | OtpFormData;

const otpSchema = emailSchema.extend({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
  firstName: z.string().min(1, { message: 'First Name is required.' }),
  lastName: z.string().min(1, { message: 'Last Name is required.' })
});
const ProfileForm = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  console.log(showLoginPrompt)
  const form = useForm<FormData>({
    resolver: zodResolver(otpSent ? otpSchema : emailSchema),
  });
  const navigate = useNavigate();

  const handleSendOtp = async (data: EmailFormData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/send-otp`, { email: data.email });
      console.log('OTP sent:', response.data);
      toast.success('OTP has been sent to your email!');
      setOtpSent(true);
    } catch (error) {
      if(axios.isAxiosError(error)){
      console.error('Error sending OTP:', error.response?.data || error.message);
      toast.error('Failed to send OTP!');
      }else{
        console.log('Error sending OTP:', error);
        toast.error('Failed to send OTP!');
      }
    }
  };
  const handleRegister = async (data: OtpFormData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, data);
      console.log('User is Verified!:', response.data);
      toast.success('Registration successful! Now you can login!');
      
      setShowLoginPrompt(true);
      setTimeout(() => {
        setShowLoginPrompt(false);
        navigate('/');
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Registration failed:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data;
        toast.error(errorMessage);
        // Set errors in the form for display
        if (errorMessage.includes('first name')) {
          form.setError('firstName', { message: errorMessage });
        } else if (errorMessage.includes('last name')) {
          form.setError('lastName', { message: errorMessage });
        }
      } else {
        toast.error('Registration failed!');
      }
    } else {
      // console.error('Registration failed:', error);
      toast.error('Registration failed!');
    }}
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try{
    if (!otpSent) {
        await form.trigger('email');
        if (form.formState.errors.email) return;
      handleSendOtp( data as EmailFormData);
    }
  else {
      await form.trigger(['password', 'otp', 'firstName', 'lastName']);
      const errors = form.formState.errors as Partial<Record<keyof OtpFormData, ZodIssue[]>>;
      if (Object.keys(errors).length > 0) return; 
      handleRegister(data as OtpFormData);
    }
    }catch(error){
      console.log('Error:', (error as Error).message);
    }
  };

  return (
    <div className="relative flex justify-center items-center bg-gray-100 h-72 p-10 rounded-md shadow-md">
    <div className="p-10  bg-opacity-80 rounded-md relative z-10 flex items-center space-x-10">
      <img src={connectblack} alt="Logo" className="h-48 w-48" />
      </div>
    <Form {...form}>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border p-6 rounded-md w-[400px] bg-gray-100 bg-opacity-80 shadow-md ">
      
      {/* {renderValidationErrors()}    */}
         <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <>
                <Input placeholder="Email" {...field} className='w-full'/>
            </>
          )}
        />
     
        {otpSent && (
          <>
           <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <>
                    <Input placeholder="First Name" {...field} />
                </>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
          <>
                    <Input placeholder="Last Name" {...field} />
                    </>
              )}
              />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
                <Input type="password" placeholder="Password" {...field} />
          )}
        />
          <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                    <Input placeholder="OTP" {...field} />
              )}
            />
          </>
        )}
        <div className="flex justify-center">
        <Button type="submit" className='w-full '>Register</Button>

        </div>
      <div className="flex justify-start text-black">
        <a href="/">Login?</a>
      </div>
      </form>
    </Form>
    </div>
  );
};

const Register = () => {
  return (
    <div className='flex justify-center items-center flex-col w-full relative min-h-screen'>
      <div className="p-5">
        
      <ProfileForm />
      </div>
      <Toaster />
    </div>
  );
};

export default Register;
