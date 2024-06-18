import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
   service: 'gmail',
   host: "sudechii.m@gmail.com",
   secure: false,
   auth: {
     user: process.env.EMAIL_USER,
     pass: process.env.EMAIL_PASS
   }
 });
 
 export const sendOtpEmail = async (email: string, otp: string) => {
   const mailOptions = {
     from: process.env.EMAIL_USER,
     to: email,
     subject: 'Your OTP Code',
     text: `Your OTP code is ${otp}`
   };

   try{
      await transporter.sendMail(mailOptions);
      console.log('OTP sent to email');
   } catch (error) {
     console.error('Error sending OTP email', error);
   }
   }
   export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:5173/resetpassword?token=${resetToken}`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset email', error);
    }
  };
  const extractResetToken = (emailBody: string): string | null => {
    // Regular expression to find reet token in the email body
    const regex = /http:\/\/example.com\/reset-password\?token=(\w+)/;
    const match = emailBody.match(regex);
    return match ? match[1] : null;
  };