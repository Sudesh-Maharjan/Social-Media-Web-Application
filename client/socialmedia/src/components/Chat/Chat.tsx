import socket from "@/socket"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import '../../../public/css/styles.css'
const Chat = () => {
   const [message, setMessage] = useState<string>('');
const [messages, setMessages] = useState<string[]>([]);
const [userId, setUserId] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

   const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(event.target.value);
      if(event.target.value.trim() !== ''){
         socket.emit('typing');
      }
    };

    //reply
    useEffect(() => {
      socket.on('connect', () =>{
         setUserId(socket.id || '');
      })
      socket.on('message', (newMessage: { message: string, senderId: string}) => {
            setMessages((prevMessages) => [...prevMessages, newMessage.message]);
         socket.on('typing', ({senderId} : {senderId: string}) => {
            if(senderId !== userId) {
               setTypingUsers((prevTypingUsers) => [...new Set([...prevTypingUsers, senderId])]);
               setTimeout(() => {
                 setTypingUsers((prevTypingUsers) => prevTypingUsers.filter(id => id !== senderId));
               }, 2000);
             }
      })
      });
      return () => {
         socket.off('connect');
         socket.off('message');
         socket.off('typing');
      };
    }, [userId]);
    const calculateWidth = (message: string) => {
      const minWidth = 50; // Minimum width in pixels
      const maxWidth = 300; // Maximum width in pixels
      const charWidth = 7; // Average width of a character
      const messageLength = message.length;
      const width = Math.min(maxWidth, Math.max(minWidth, messageLength * charWidth));
      return `${width}px`;
    };

    const sendMessage =() => {
      if(message.trim() !== ''){
         const newMessage = { message, senderId: userId};
         socket.emit('message', newMessage);
         setMessage('');
      }
   };
  return (
    <>
  <div className="absolute rounded-md shadow-md w-80 h-80 left-56 hover:cursor-pointer flex flex-col justify-between">
        <div className="">
          <h2 className="bg-black text-white rounded-t-md p-2 text-sm">Name</h2>
          <div className="scrollable-container inline-block overflow-y-auto h-full p-2" style={{ maxHeight: "200px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className="flex justify-center items-center p-2 rounded-2xl bg-black text-white mx-2 my-3"
                style={{ maxWidth: calculateWidth(msg) }}
              >
                {msg}
              </div>
            ))}
             
          </div>
        </div>
        <div className="flex flex-col">
        {typingUsers.length > 0 && (
              <div className="text-sm text-black mx-2">
                 typing...
              </div>
            )}
        <div className="flex gap-3 items-end p-2">
          <input
            type="text"
            id="message"
            placeholder="Enter Message"
            value={message}
            onChange={handleMessageChange}
            className="w-72 p-2 border border-slate-300 rounded-md"
          />
          <Button id="sendBtn" onClick={sendMessage} className="">Send</Button>
        </div>
        </div>
      </div>
    </>
  )
}

export default Chat
