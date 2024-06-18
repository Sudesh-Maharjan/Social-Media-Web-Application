import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';

const sendResetTokenSchema = z.object({
   email: z.string().email({ message: 'Invalid email address.' }),
 });
 
 const resetPasswordSchema = z.object({
    resetToken: z.string(),
   newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
 
type SendResetTokenFormData = z.infer<typeof sendResetTokenSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;


const ResetPassword = () => {
    const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [resetToken, setResetToken] = useState<string | null>(null);
   const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
   const formSendResetToken = useForm<SendResetTokenFormData>({
     resolver: zodResolver(sendResetTokenSchema),
   });
   const formResetPassword = useForm<ResetPasswordFormData>({
     resolver: zodResolver(resetPasswordSchema),
   });
   useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setResetToken(token);
        validateResetToken(token);
      }
    }, []);
    
   const validateResetToken = async (token: string) => {
     try {
       const response = await axios.post(`${API_BASE_URL}/users/password/validate-token`, {
         resetToken: token,
       });
   
       if (response.status === 200) {
         setShowResetPasswordForm(true);
       } else {
         toast.error('Invalid reset token. Please try again.');
       }
     } catch (error) {
       console.error('Error validating reset token:', error);
       toast.error('Failed to validate reset token. Please try again later.');
     }
   };

  const handleSendResetToken: SubmitHandler<SendResetTokenFormData> = async (data) => {
   setLoading(true);
   try {
     const response = await axios.post(`${API_BASE_URL}/users/password/reset/token`, {
       email: data.email,
     });
     // Reset form and show success message
     formSendResetToken.reset();
     setShowResetPasswordForm(true);
     toast.success(response.data);
   } catch (error) {
     if (axios.isAxiosError(error)) {
       toast.error(error.response?.data || 'Failed to send password reset token. Please try again.');
     } else {
       toast.error('Failed to send password reset token. Please try again later.');
     }
   } finally {
     setLoading(false);
   }
 };
 const handleResetPassword: SubmitHandler<ResetPasswordFormData> = async (data) => {
   console.log('Called')
   setLoading(true);
   try {
     const response = await axios.post(`${API_BASE_URL}/users/password/reset`, {
       resetToken: data.resetToken,
       newPassword: data.newPassword,
     });
     // Reset form and show success message
     formResetPassword.reset();
     toast.success(response.data);
     setTimeout(() => {
      navigate('/');
    }, 1000);
   } catch (error) {
     if (axios.isAxiosError(error)) {
       toast.error(error.response?.data || 'Failed to reset password. Please try again.');
     } else {
       toast.error('Failed to reset password. Please try again later.');
     }
   } finally {
     setLoading(false);
   }
 };
  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen">
         <Toaster/>
        <div className="p-9 bg-gray-100 bg-opacity-80 rounded-md shadow-md relative z-10">
          {!showResetPasswordForm ? (
            <form onSubmit={formSendResetToken.handleSubmit(handleSendResetToken)} className="space-y-6 w-[400px]">
              <div className="flex flex-col">
                <label htmlFor="email" className='my-2 mx-1'>Email</label>
                <Input type="email" id="email" {...formSendResetToken.register('email')} placeholder="Enter your email" />
              </div>
              <div className="flex justify-center">
                <Button type="submit" className='w-full' disabled={loading}>
                  {loading ? 'Loading...' : 'Send Reset Token'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={formResetPassword.handleSubmit(handleResetPassword)} className="space-y-6 w-[400px] bg-gray-100">
                   <input type="hidden" id="resetToken" {...formResetPassword.register('resetToken')} value={resetToken || ''} />
              <div className="flex flex-col">
                <label htmlFor="newPassword">New Password</label>
                <Input type="password" id="newPassword" {...formResetPassword.register('newPassword')} placeholder="Enter new password" />
              </div>
              <div className="flex justify-center">
                <Button type="submit" className='w-full' disabled={loading}>
                  {loading ? 'Loading...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
