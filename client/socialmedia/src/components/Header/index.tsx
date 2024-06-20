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
const Index = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const darkMode = useSelector((state: AppState) => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);//dropdown when clicked outside

useEffect(()=>{
   const handleClickOutside = (event: MouseEvent)=>{
      if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)){
         setIsDropdownOpen(false);
      }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return()=>{
      document.removeEventListener('mousedown', handleClickOutside);
   };
}, []);

// Navbar dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('User_data');
    // Cookies.remove('darkMode');
    navigate('/');
  };

  useEffect(() => {
const userData = localStorage.getItem('User_data');
if(userData){
   const user = JSON.parse(userData);
   setUserName(user.firstName + ' ' + user.lastName);
}
  }, []);



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
        <button className='rounded-full bg-slate-200 p-2 text-secondary-foreground hover:bg-slate-300 transition duration-200'>
        <IoIosChatboxes className='text-2xl'/>
        </button>
        <button className='rounded-full bg-slate-200 p-2 text-secondary-foreground hover:bg-slate-300 transition duration-200'>
        <IoIosNotifications className='text-2xl'/>
        </button>
              <button
                className="flex text-white items-center focus:outline-none "
                onClick={toggleDropdown}
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
                  <div className="px-4 py-2 flex items-center gap-3">
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
            </div>
       </div>
     </div>
   </div>
 </nav>
  );
};

export default Index;
