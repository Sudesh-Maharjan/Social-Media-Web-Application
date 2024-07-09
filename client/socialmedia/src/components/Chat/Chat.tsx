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
import { AppState } from "@/types";
const Chat = () => {
  const darkMode = useSelector((state: AppState) => state.theme.darkMode);

  const [message, setMessage] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("");
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector(selectUsers);
  const { posts } = useSelector((state: RootState) => state.posts);

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
    socket.on('groupChatStarted', async ({ roomId, senderId, participants }) => {
      setRoom(roomId);
      setChatStarted(true);
      socket.emit('joinRoom', roomId);
      console.log('Group chat:', roomId, senderId, participants);
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
     socket.off("groupChatStarted");
     socket.off('fetchChatHistory');
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
    if (selectedUsers.length === 0) {
      console.error('No user selected for chat.');
      return;
    }
    const sortedSelectedUsers = [...selectedUsers, userId].sort();
    const roomId = sortedSelectedUsers.join('-');
    console.log('Room ID', roomId);
    socket.emit('startChat', { recipientIds: selectedUsers, roomId });
    setRoom(roomId);
    setChatStarted(true);//Chat box opens after starting chat
  };
  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        message,
        senderId: userId,
        senderSocketId: socket.id,
        type: selectedUsers.length === 1 ? 'private' : 'group',
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
    <div className={`relative h-screen flex ${darkMode ? 'bg-customBlack' : 'bg-customWhite'}`}>
    {/* <div className="flex-shrink-0">
      <Button onClick={() => setSidebarOpen(true)} className={`w-56 h-12 ${darkMode ? 'bg-customHoverBlack hover:bg-customHoverBlack' : 'bg-customBlack'}`}>+ Start Chat</Button>
    </div> */}

    <div className={`fixed inset-y-0 right-0 w-80 ${darkMode ? 'bg-customBlack border-customHoverBlack text-customWhite' : 'bg-customWhite '} transition duration-300 ease-in-out pt-16`}>
      <div className="p-4">
        <h2 className="text-lg font-medium mb-4">Select users to chat</h2>
        <ul>
          {users.map((user) => (
            <li key={user._id} className={`flex items-center cursor-pointer mb-2 p-2 rounded-md ${darkMode ? 'hover:bg-customHoverBlack': 'hover:bg-customGray'}`}>
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedUsers.includes(user._id)}
                onChange={() => {
                  if (selectedUsers.includes(user._id)) {
                    setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                  } else {
                    setSelectedUsers([...selectedUsers, user._id]);
                  }
                }}
              />
              <div className="">
                {
                  posts.map((post) => {
                    if(post.userId === user._id){
                      return <img key={post._id} src={post.creatorID.profilePicture} alt="profile" className="h-8 w-8 rounded-full" />;
                    }
                  
                  })
                }
              </div>
              {user.firstName} {user.lastName}
            </li>
          ))}
        </ul>
        <Button onClick={handleStartChat} className={`w-full mt-4 ${darkMode ? 'bg-customHoverBlack hover:bg-customHoverBlack' : 'bg-customBlack hover:bg-customBlack'}}`}>Start Chat</Button>
      </div>
    </div>
    {chatStarted && (
    <div className={`fixed bottom-0 right-10 z-10 rounded-md cursor-pointer h-[400px] w-[340px] flex flex-col ${darkMode ? 'bg-customBlack border border-customHoverBlack' :'bg-customWhite border border-customGray'}`}>
      <div className={`p-2 border-b flex justify-between ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h1 className=" font-medium">
          {selectedUsers.length > 1 ? 'Group Chat' : 'Private Chat'}
        </h1>
        {chatStarted && (
        <button onClick={handleTerminateChat} className="">
          x
        </button>
    )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
            <div className="inline-block py-2 px-4 rounded-lg" style={{ background: msg.senderId === userId ? '#DCF8C6' : '#ECECEC', width: calculateWidth(msg.message) }}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2">
      <button onClick={scrollToBottom}>
          <IoIosArrowDropdownCircle />
        </button>
        <div className="flex items-center m-2">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className={`flex-1 border ${darkMode ? 'bg-customBlack border-customHoverBlack' : 'bg-customWhite border-customGray rounded-md p-1'} ${darkMode ? 'text-white' : 'text-black'}`}
          />
          <Button onClick={sendMessage} className="ml-2">
            <IoMdSend />
          </Button>
        </div>
        {typingUsers.length > 0 && (
          <div className="text-gray-500 mt-2">
            {typingUsers.map((id) => (
              <span key={id}>{id} is typing...</span>
            ))}
          </div>
        )}
      </div>
    </div>
    )}
   
  </div>
  );
};

export default Chat;