import { useState, useEffect, useRef } from 'react';
import { RiArrowDropDownLine,RiMoonClearLine, RiSunLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/redux/slices/themeSlice';
import connectwhitelogo from '../../../public/images/connectwhite.png'
import connectblacklogo from '../../../public/images/connecblack.png'
import { AppState } from '@/types';
import { IoIosNotifications } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { RiSearchLine } from 'react-icons/ri';
import '../../../public/css/styles.css';
import socket from '@/socket';
import { AppDispatch, RootState } from '@/redux/store';
import { searchUsers , selectUsers} from '@/redux/slices/userSlice';
import { User } from '@/types';
import { fetchNotifications , deleteNotification} from '@/redux/slices/notificationSlice';

const Index = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const darkMode = useSelector((state: AppState) => state.theme.darkMode);
  const users = useSelector(selectUsers);
  const dispatch:AppDispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);//dropdown when clicked outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
const notifications =useSelector((state: RootState) => state.notifications.notifications);
// const recipient = useSelector((state: RootState) => state.auth.userId);
const userId = localStorage.getItem('userId');
  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));

      socket.emit('storeSocketId', userId);
    socket.on('notification', (data) => {
      const { recipientId } = data;
      if (recipientId === userId) {
        dispatch(fetchNotifications(recipientId));
      }
    });

    return () => {
      socket.off('notification');
    };
  }
  }, [userId, dispatch]);

  useEffect(()=>{
   const handleClickOutside = (event: MouseEvent)=>{
      if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)){
         setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return()=>{
      document.removeEventListener('mousedown', handleClickOutside);
   };
}, []);

useEffect(() => {
  const userData = localStorage.getItem('User_data');
  if(userData){
     const user = JSON.parse(userData);
     setUserName(user.firstName + ' ' + user.lastName);
  }
    }, []);


  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    } else {
      console.error("User ID not found in localStorage");
    }
  }, [dispatch ,userId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setSearchResultsVisible(true);
    if (event.target.value === '') {
      setSearchResultsVisible(false);
    } else {
      dispatch(searchUsers(event.target.value));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('User_data');
    navigate('/');
  };
  //aruko
  const handleUserSelect = (user: User) => {
    setIsSearchOpen(false);
    navigate(`/profile/${user._id}`);
  };
  //afnai
  const navigateToUserProfile = () => {
    const userData = localStorage.getItem('User_data');
    if (userData) {
      const user = JSON.parse(userData);
      navigate(`/profile/${user.id}`);
    }
  };
  const handleDeleteNotification = (notificationId: string) => {
    dispatch(deleteNotification(notificationId));
  };
  return (
   <nav className={`sticky z-10 border border-b-1 border-b-black ${darkMode ? 'bg-secondary-foreground' : 'bg-white'}`}>
   <div className="max-w-7xl mx-auto px-4">
     <div className="flex justify-between items-center">
       <div className="flex items-center">
       <img
              className="h-16 w-16"
              src={darkMode ? connectwhitelogo : connectblacklogo}
              alt="Logo"
            />
       </div>
       <div className="flex items-center">
       <div className="relative" ref={dropdownRef}>
         {/* Chat and Notification buttons */}
        <div className="flex gap-4 p-2">
          <div className='relative'>
        <input
        ref={searchRef}
          type="text"
          className={`rounded-full bg-slate-200 p-2 text-secondary-foreground transition duration-200 ${
            isSearchOpen ? 'block w-64' : 'hidden'
          }`}
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`rounded-full bg-slate-200 p-2 text-secondary-foreground hover:bg-slate-300 transition duration-200 ${
            isSearchOpen ? 'hidden' : 'block'
          }`}
        >
          <RiSearchLine className='text-2xl'/>
        </button>
        {/* Search input */}
        
  {searchResultsVisible && (
                <div className={`absolute z-50 right-0 mt-2 w-64 ${darkMode ? 'bg-secondary-foreground' : 'bg-white'} shadow-lg py-1 rounded-md flex flex-col text-${darkMode ? 'white' : 'black'}`}>
                  {users.length > 0 ? (
                    users.map(user => (
                      <div key={user._id} className={`px-4 py-2 cursor-pointer  flex flex-col ${darkMode? 'hover:bg-white hover:text-black' : 'hover:bg-black hover:text-white'}`} onClick={() =>handleUserSelect(user)}>
                        
                        <span>{user.firstName} {user.lastName}</span>
                        <span className='text-sm'>{user.email}</span>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-2">No results found</p>
                  )}
                </div>
              )}
</div>
<button className='rounded-full bg-slate-200 p-2 text-secondary-foreground hover:bg-slate-300 transition duration-200'>
                  <IoIosChatboxes onClick={() => setIsChatOpen(!isChatOpen)} className='text-2xl'/>
                </button>
                <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className='rounded-full bg-slate-200 p-2 text-secondary-foreground hover:bg-slate-300 transition duration-200'>
                  <IoIosNotifications className='text-2xl'/>
                </button>
                <button
                  className="flex text-white items-center focus:outline-none "
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Profile"
                />
                <RiArrowDropDownLine className={`text-${darkMode ? 'white' : 'black'} text-2xl`} />
              </button>
              </div>
              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-secondary-foreground' : 'bg-white'} shadow-lg py-1 rounded-md flex flex-col text-${darkMode ? 'white' : 'black'}`}>
                  <div className={`px-4 py-2 flex items-center gap-3 hover:cursor-pointer ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={navigateToUserProfile}>
                    <FaUser />
                    <span className={`text-${darkMode ? 'white' : 'black'}`}>{userName}</span>
                  </div>
                  <div className={`flex px-6 py-2 gap-3 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-md items-center cursor-pointer`}  onClick={handleLogout}>
                    <FiLogOut className={`text-${darkMode ? 'white' : 'black'}`} />
                    <button
                      className={`block px-4 py-2 text-${darkMode ? 'white' : 'black'}`}
                    >
                      Logout
                    </button>
                  </div>
                  <div className={`flex px-6 py-2 gap-3 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} items-center cursor-pointer`}>
                    <CiSettings className="text-xl" />
                    <div
                      className={`block px-4 py-2 text-${darkMode ? 'white' : 'black'}`}
                    >
                      Settings
                    </div>
                  </div>
                  <div className={`flex px-6 py-2 gap-7 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} items-center cursor-pointer`} onClick={() => dispatch(toggleTheme())}>
                    {darkMode ? <RiSunLine className="text-xl text-yellow-400" /> : <RiMoonClearLine className="text-xl text-gray-700" />}
                    <span className={`text-${darkMode ? 'white' : 'black'}`}>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                </div>
              )}
               {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-black rounded-lg shadow-lg overflow-hidden z-20" ref={notificationRef}>
          <div className={`flex items-center justify-between px-4 py-2 ${darkMode ? 'bg-black text-white' : 'bg-white text-black' }`}>
            <h2 className="text-lg">Notifications</h2>
            <button className="focus:outline-none" onClick={() => setIsNotificationOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="divide-y divide-gray-300">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification._id} className={`px-4 py-3 cursor-pointer hover:bg-gray-100 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{notification.message}</p>
                  <button onClick={() => handleDeleteNotification(notification._id)} className="text-xs text-gray-500 hover:text-red-500 focus:outline-none">
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="px-4 py-3 text-sm">No notifications</p>
            )}
                    </div>
                  </div>
              )}
               {isChatOpen && (
                <div ref={chatRef} className={`absolute right-0 mt-2 w-72 ${darkMode ? 'bg-secondary-foreground' : 'bg-white'} shadow-lg py-1 rounded-md flex flex-col text-${darkMode ? 'white' : 'black'}`}>
                  <div className="px-4 py-2">
                    <h4 className="font-semibold">Chat</h4>
                    {/* Example Chat */}
                    <div className="mt-2">
                      <p>User123: Hello!</p>
                      <p>You: Hi there!</p>
                      {/* Add more chat messages as needed */}
                    </div>
                  </div>
                </div>
              )}
            </div>
       </div>
     </div>
   </div>
 </nav>
  );
};
export default Index;
