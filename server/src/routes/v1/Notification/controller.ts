import { Request, Response} from 'express';
import Notification from './model';

export const getNotifications = async (req: Request, res: Response) => {
   try {
     const recipientId = req.params.userId; // Assuming recipient is passed in params
     const notifications = await Notification.find({ recipient: recipientId })
       .sort({ createdAt: -1 }) // Sorting by createdAt descending
       .exec();
 
     res.json(notifications);
   } catch (error: any) {
     res.status(500).json({ message: error.message });
   }
 };

// export const createNotification = async (req: Request, res:Response) =>{
//    const {recipient, message, type} = req.body;
//    console.log('Create Message:', message);
//    console.log('Create Recipient:', recipient);
//    try {
//       const newNotification = new Notification({
//          recipient,
//          message,
//          type,
//       });
//       await newNotification.save();
//    } catch (error: any) {
//       res.status(400).json({message: error.message});
//    }
// }

export const deleteNotification = async (req:Request, res:Response) => {
   try {
      const deleteNotification = await Notification.findByIdAndDelete(req.params.id)
      if(!deleteNotification){
         return res.status(404).json({message: 'Notification not found'});
      }
      res.json({message:'Notification deleted'});
   } catch (error: any) {
      res.status(500).json({message: error.message});
   }
}