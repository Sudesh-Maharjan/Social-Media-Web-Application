import { useEffect, useState, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import socket from "@/socket";
import { fetchUsers, selectUsers } from "@/redux/slices/userSlice";
import "../../../public/css/styles.css";
import {fetchChatHistory, addMessage} from "@/redux/slices/chatSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { IoMdSend } from "react-icons/io";
import { IoIosArrowDropdownCircle } from "react-icons/io";
const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("");
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector(selectUsers);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const messages: {
    message: string;
    senderId: string;
    type: string;
    roomId?: string;
  }[] = useSelector((state: RootState) => state.chat.messages);
  const chatStatus = useSelector((state: RootState) => state.chat.status);
  const userId = localStorage.getItem('userId');
const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dispatch(fetchUsers());

    socket.on("connect", () => {
      // setUserId(socket.id || "");
      console.log('Connected to server');
    });
    socket.on('fetchChatHistory', (chatHistory) => {
      dispatch(addMessage(chatHistory));
      });
      
    socket.on('privateChatStarted', async({ roomId, senderId }) => {
        setRoom(roomId);
        setChatStarted(true);
        socket.emit('joinRoom', roomId);
      console.log('Private chat:', roomId, senderId);
      dispatch(fetchChatHistory(roomId));
    });

    socket.on("message", (newMessage)=> {
     dispatch(addMessage(newMessage));
     scrollToBottom();
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId !== userId) {
        setTypingUsers((prevTypingUsers) =>
          [...new Set([...prevTypingUsers, senderId])]
        );
        setTimeout(() => {
          setTypingUsers((prevTypingUsers) =>
            prevTypingUsers.filter((id) => id !== senderId)
          );
        }, 2000);
      }
    });
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("typing");
     socket.off("privateChatStarted");
    };
  }, [userId, dispatch]);

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMessage(event.target.value);
    if (event.target.value.trim() !== "") {
      socket.emit("typing", { type: 'private', room });
    }
  };

  const calculateWidth = (message: string) => {
    const minWidth = 50;
    const maxWidth = 300;
    const charWidth = 7;
    const messageLength = message ? message.length : 0;
    const width = Math.min(maxWidth, Math.max(minWidth, messageLength * charWidth));
    return `${width}px`;
  };

  const handleStartChat = () => {
    if (!selectedUser) {
      console.error('No user selected for chat.');
      return;
    }
    const roomId = `${userId}${selectedUser}`;
    console.log('Room ID', roomId);
    socket.emit('startPrivateChat', { recipientId: selectedUser, roomId });
    setRoom(roomId);
    setChatStarted(true);//Chat box opens after starting chat
    setSidebarOpen(false);//sidebar closes after starting chat
  };
  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        message,
        senderId: userId,
        senderSocketId: socket.id,
        type: 'private',
        roomId: room,
      };

      socket.emit("message", newMessage);//send msg to server
     dispatch(addMessage(newMessage));
      setMessage("");//clear input field
      scrollToBottom();
    }
  };
const scrollToBottom = () => {
  if(scrollRef.current){
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
};
const handleTerminateChat = () => {
  setChatStarted(false);
  setRoom("");
  setTypingUsers([]);
  dispatch({ type: "chat/clearMessages"});
};

  return (
    <div className="relative h-screen flex">
    <div className="flex-shrink-0">
      <Button onClick={() => setSidebarOpen(true)} className="w-56 h-12">+ Start Chat</Button>
    </div>
    
    <div className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-400`}>
      <div className="p-3 mt-32">
        <h2 className="text-xl font-semibold mb-4">Select a User to Chat</h2>
        <div className="user-list space-y-2">
          {users.map((user) => (
            <div key={user._id} className="user-item flex items-center space-x-2">
              <input
                type="radio"
                id={user._id}
                name="selectedUser"
                value={user._id}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="form-radio"
              />
              <label htmlFor={user._id}>{user.firstName + " " + user.lastName}</label>
            </div>
          ))}
        </div>
        <Button onClick={handleStartChat} className="mt-4 w-full">Start Chat</Button>
      </div>
    </div>
    
    {chatStarted && (
      <div className="fixed bottom-6 rounded-md shadow-md w-[350px] h-96 right-16 hover:cursor-pointer flex flex-col justify-between">
        <div className="relative">
        <button className="absolute top-2 right-2 text-white" onClick={handleTerminateChat}>✖</button>
          <h2 className="bg-black text-white rounded-t-md p-2 text-md">Chat</h2>
          <div ref={scrollRef} className="scrollable-container overflow-y-auto h-full p-2 " style={{ maxHeight: "200px" }}>
          {chatStatus === "loading" && <p>Loading chat history...</p>}
      
            {messages.map((msg, index) => (
              msg.senderId === userId ? (
              <div
                key={index}
                className="p-2 rounded-md  my-1 bg-customGray text-customBlack ml-[160px] flex justify-end"
                style={{ maxWidth: calculateWidth(msg.message) }}
              >
                {msg.message}
                
              </div>
              ) : (
                <div
                key={index}
                className="p-2 rounded-md my-1 bg-customBlack text-white inline-block "
                style={{ maxWidth: calculateWidth(msg.message) }}
              >
                {msg.message}
              </div>
              )
            ))}
          </div>
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
            </div>
          )}
        </div>
        <div className="flex justify-center">
        <button onClick={scrollToBottom} className=" mx-1 rounded-full bg-customHoverBlack hover:bg-slate-600 hover:animate-spin transition duration-200  text-white p-2"><IoIosArrowDropdownCircle /></button>
        </div>
        <div className=" rounded-b-md flex flex-col items-center gap-3">
<div className="flex w-full items-center justify-center my-2">
          <input
            className="w-full h-8 p-1 border border-gray-300 rounded-full"
            type="text"
            placeholder="Aa"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button onClick={sendMessage} className=" mx-2 flex text-xl">
          <IoMdSend />
          </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Chat;
