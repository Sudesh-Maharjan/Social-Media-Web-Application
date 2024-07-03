import {Request, Response} from 'express';
import Message from './model';

export const getMessagesForRoom = async (req: Request, res: Response) => {
   const {roomId} = req.params;
   try {
      const messages = await Message.find({roomId}).sort({ timeStamp: 1});
      res.json(messages);
   } catch (error) {
      res.status(500).json({error: 'Failed to fetch messages'});
   }

}