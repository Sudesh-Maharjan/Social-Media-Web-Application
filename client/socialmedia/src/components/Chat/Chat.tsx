import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import socket from "@/socket";
import { fetchUsers, selectUsers } from "@/redux/slices/userSlice";
import "../../../public/css/styles.css";

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{
    message: string;
    senderId: string;
    type: string;
    roomId?: string;
  }[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("");
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
console.log('Room:',room)
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    socket.on("connect", () => {
      setUserId(socket.id || "");
      console.log('Socket ID', socket.id)
      console.log('Connected to server');
    });

    socket.on("message", (newMessage: {
      message: string;
      senderId: string;
      type: string;
      roomId?: string;
    }) => {
      console.log("Sender ID:", newMessage.senderId);
      console.log('Type:', newMessage.type);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
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
    socket.on('privateChatStarted', ({ roomId, senderId }) => {
      console.log('RoomID:', roomId, 'SenderID:', senderId, 'UserID:', userId)
        setRoom(roomId);
        setChatStarted(true);
        socket.emit('joinRoom', roomId);
      console.log('Private chat from backend:', roomId, senderId)
    });

    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("typing");
     socket.off("privateChatStarted");
    };
  }, [userId, selectedUser]);

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
    const messageLength = message.length;
    const width = Math.min(maxWidth, Math.max(minWidth, messageLength * charWidth));
    return `${width}px`;
  };

  const handleStartChat = () => {
    if (!selectedUser) {
      console.error('No user selected for chat.');
      return;
    }
    const roomId = `${socket.id}${selectedUser}`;
    console.log('Room ID', roomId);
    socket.emit('startPrivateChat', { recipientId: selectedUser, roomId });
    setRoom(roomId);
    setChatStarted(true);
    setSidebarOpen(false);
  };
  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        message,
        senderId: socket.id,
        type: 'private',
        roomId: room,
      };

      socket.emit("message", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };


  return (
    <div className="relative h-screen flex">
    <div className="flex-shrink-0">
      <Button onClick={() => setSidebarOpen(true)}>+ Start Chat</Button>
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
      <div className="absolute rounded-md shadow-md w-80 h-80 left-56 hover:cursor-pointer flex flex-col justify-between">
        <div>
          <h2 className="bg-black text-white rounded-t-md p-2 text-sm">Name</h2>
          <div className="scrollable-container inline-block overflow-y-auto h-full p-2" style={{ maxHeight: "200px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-md my-1 ${msg.senderId === userId ? "bg-blue-300 self-end" : "bg-gray-300 self-start"}`}
                style={{ maxWidth: calculateWidth(msg.message) }}
              >
                {msg.message}
              </div>
            ))}
          </div>
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-100 rounded-b-md">
          <input
            className="w-full p-2 rounded-md border border-gray-300"
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={handleMessageChange}
            // onKeyPress={(e) => {
            //   if (e.key === "Enter") sendMessage();
            // }}
          />
          <Button onClick={sendMessage} className="mt-2">
            Send
          </Button>
        </div>
      </div>
    )}
  </div>
  );
};

export default Chat;
