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
    recipientId?: string;
    groupId?: string;
  }[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatType, setChatType] = useState<string>("public"); // 'public', 'private', 'group'
  const [startChat, setStartChat] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<string>("");
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    socket.on("connect", () => {
      setUserId(socket.id || "");
    });

    socket.on("message", (newMessage: {
      message: string;
      senderId: string;
      type: string;
      recipientId?: string;
      groupId?: string;
    }) => {
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
    socket.on('openChat', (newMessage: {
      message: string;
      senderId: string;
      type: string;
      recipientId?: string;
      groupId?: string;
    }) => {
      if (newMessage.recipientId === userId || (newMessage.type === "group" && newMessage.groupId)) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setStartChat(true);
      }
    });

    socket.on('roomCreated', ({ roomId, userId }) => {
      if (userId === socket.id) {
        setGroupId(roomId);
        setStartChat(true);
        socket.emit("join", roomId, selectedUsers);
      }
    });

    socket.on('userJoined', ({ roomId, userId }) => {
      console.log(`User ${userId} joined room: ${roomId}`);
    });
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("typing");
      socket.off("openChat");
      socket.off("userJoined");
      socket.off("userJoined");
    };
  }, [userId]);

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMessage(event.target.value);
    if (event.target.value.trim() !== "") {
      socket.emit("typing", { type: chatType, recipientId: selectedUsers[0], groupId });
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
    if (selectedUsers.length === 0) {
    console.error('No users selected for chat.');
    return;
  }
    if (selectedUsers.length === 1) {
      setChatType("private");
      setStartChat(true);
      socket.emit("join", selectedUsers[0]);
    } else if (selectedUsers.length > 1) {
      setChatType("group");
      setStartChat(true);
      const newGroupId = generateGroupId(); // Generate a unique group ID (you can implement this)
      setGroupId(newGroupId);
      setMessages([]); // Clear previous messages
      socket.emit("join", newGroupId, selectedUsers); // Join group chat with the generated group ID
    }
  };

  const generateGroupId = (): string => {
    return "group_chat_" + Math.random().toString(36).substr(2, 9);
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      let newMessage: {
        message: string;
        senderId: string;
        type: string;
        recipientId?: string;
        groupId?: string;
      };
  
      if (chatType === "private") {
        newMessage = {
          message,
          senderId: userId,
          type: chatType,
          recipientId: selectedUsers[0], // Assign recipientId for private chat
        };
      } else if (chatType === "group") {
        newMessage = {
          message,
          senderId: userId,
          type: chatType,
          groupId: groupId, // Assign groupId for group chat
        };
      } else {
        newMessage = {
          message,
          senderId: userId,
          type: chatType,
        };
      }
  
      socket.emit("message", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };
  

  if (!startChat) {
    return (
      <div className="user-selection-panel">
        <h2>Select Users to Chat</h2>
        <div className="user-list">
          {users.map((user) => (
            <div key={user._id} className="user-item">
              <input
                type="checkbox"
                id={user._id}
                value={user._id}
                onChange={(e) => {
                  const selectedUserId = e.target.value;
                  setSelectedUsers((prevSelectedUsers) =>
                    e.target.checked
                      ? [...prevSelectedUsers, selectedUserId]
                      : prevSelectedUsers.filter(
                          (id) => id !== selectedUserId
                        )
                  );
                }}
              />
              <label htmlFor={user._id}>{user.firstName + " " + user.lastName}</label>
            </div>
          ))}
        </div>
        <Button onClick={handleStartChat}>Start Chat</Button>
      </div>
    );
  }

  return (
    <div className="absolute rounded-md shadow-md w-80 h-80 left-56 hover:cursor-pointer flex flex-col justify-between">
      <div>
        <h2 className="bg-black text-white rounded-t-md p-2 text-sm">Name</h2>
        <div
          className="scrollable-container inline-block overflow-y-auto h-full p-2"
          style={{ maxHeight: "200px" }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-md my-1 ${
                msg.senderId === userId ? "bg-blue-300 self-end" : "bg-gray-300 self-start"
              }`}
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
          onKeyPress={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <Button onClick={sendMessage} className="mt-2">
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;
