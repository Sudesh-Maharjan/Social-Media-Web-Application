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
import { searchUsers , selectCurrentUser, selectUsers} from '@/redux/slices/userSlice';
import { User } from '@/types';
import { fetchNotifications , deleteNotification} from '@/redux/slices/notificationSlice';

// const currentUser =
const Index = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
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
const currentUser = useSelector(selectCurrentUser);
console.log(currentUser)
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
     setProfilePicture(user.profilePicture);
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
   <nav className={`sticky z-30 border border-b-1 top-0 border-b-black ${darkMode ? 'bg-customSoftBlack' : 'bg-customWhite'}`}>
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
          className={`rounded-full bg-customGray p-2 text-secondary-foreground transition duration-200 ${
            isSearchOpen ? 'block w-64' : 'hidden'
          }`}
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`rounded-full  p-2 ${darkMode ? 'bg-customHoverBlack text-customWhite': 'bg-customGray text-customBlack'} transition duration-200 ${
            isSearchOpen ? 'hidden' : 'block'
          }`}
        >
          <RiSearchLine className='text-2xl'/>
        </button>
        {/* Search input */}
        
  {searchResultsVisible && (
                <div className={`absolute z-50 right-0 mt-2 w-64 ${darkMode ? 'bg-customBlack text-customWhite' : 'bg-customWhite text-customBlack'} shadow-lg py-1 rounded-md flex flex-col`}>
                  {users.length > 0 ? (
                    users.map(user => (
                      <div key={user._id} className={`px-4 py-2 cursor-pointer  flex flex-col ${darkMode? 'hover:bg-customWhite hover:text-customBlack' : 'hover:bg-customBlack hover:text-customWhite'}`} onClick={() =>handleUserSelect(user)}>
                        
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
<button className={`rounded-full p-2 transition duration-200 ${darkMode ? 'bg-customHoverBlack text-customWhite' : 'bg-customGray text-customBlack'}`}>
                  <IoIosChatboxes onClick={() => setIsChatOpen(!isChatOpen)} className='text-2xl'/>
                </button>
                <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`rounded-full  p-2 transition duration-200 ${darkMode ? 'bg-customHoverBlack text-customWhite' : 'bg-customGray text-customBlack'}`}>
                  <IoIosNotifications className='text-2xl'/>
                </button>
                <button
                  className="flex text-customWhite items-center focus:outline-none "
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={profilePicture || currentUser?.profilePicture}
                  alt="Profile"
                />
                <RiArrowDropDownLine className={`${darkMode ? 'text-customWhite' : 'text-customBlack'} text-2xl`} />
              </button>
              </div>
              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-customBlack' : 'bg-customWhite'} shadow-lg py-1 rounded-md flex flex-col ${darkMode ? 'text-customWhite' : 'text-customBlack'}`}>
                  <div className={`px-4 py-2 flex items-center gap-3 hover:cursor-pointer ${darkMode ? 'hover:bg-customHoverBlack' : 'hover:bg-customGray'}`} onClick={navigateToUserProfile}>
                    <FaUser />
                    <span className={`${darkMode ? 'cus' : 'black'}`}>{userName}</span>
                  </div>
                  <div className={`flex px-6 py-2 gap-3 ${darkMode ? 'hover:bg-customHoverBlack' : 'hover:bg-customGray'} rounded-md items-center cursor-pointer`}  onClick={handleLogout}>
                    <FiLogOut className={`${darkMode ? 'text-customWhite' : 'text-customBlack'}`} />
                    <button
                      className={`block px-4 py-2 ${darkMode ? 'text-customWhite' : 'text-customBlack'}`}
                    >
                      Logout
                    </button>
                  </div>
                  <div className={`flex px-6 py-2 gap-3 ${darkMode ? 'hover:bg-customHoverBlack' : 'hover:bg-customGray'} items-center cursor-pointer`}>
                    <CiSettings className="text-xl" />
                    <div
                      className={`block px-4 py-2 ${darkMode ? 'text-customWhite' : 'text-customBlack'}`}
                    >
                      Settings
                    </div>
                  </div>
                  <div className={`flex px-6 py-2 gap-7 ${darkMode ? 'hover:bg-customHoverBlack' : 'hover:bg-customGray'} items-center cursor-pointer`} onClick={() => dispatch(toggleTheme())}>
                    {darkMode ? <RiSunLine className="text-xl text-yellow-400" /> : <RiMoonClearLine className="text-xl text-gray-700" />}
                    <span className={`text-${darkMode ? 'white' : 'black'}`}>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                </div>
              )}
               {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 border rounded-lg shadow-lg overflow-hidden z-20" ref={notificationRef}>
          <div className={`flex items-center justify-between px-4 py-2 ${darkMode ? 'bg-customBlack text-customWhite' : 'bg-customWhite text-customBlack' }`}>
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
                <div key={notification._id} className={`px-4 py-3 cursor-pointer hover:bg-gray-100 ${darkMode ? 'bg-customBlack text-customWhite' : 'bg-customWhite text-customBlack'}`}>
                  <p className={`text-sm ${darkMode ? 'text-customWhite' : 'text-customBlack'}`}>{notification.message}</p>
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
