import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser, selectUsers, selectUsersLoading, fetchUsers } from '../../redux/slices/userSlice';
import { AppDispatch } from '@/redux/store';
import { User } from '@/types';
import { Button } from '../ui/button';

const UserSuggestions = () => {
  const dispatch: AppDispatch = useDispatch();
  const users: User[] = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const darkMode = useSelector((state: AppState) => state.theme.darkMode);

  useEffect(() => {
    const userData = localStorage.getItem('userId');
    if (userData) {
      try {
        setLoggedInUserId(userData);
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
      }
    }
    dispatch(fetchUsers());
  }, [dispatch, loggedInUserId]);

  const handleFollow = async (userId: string) => {
    
    if (loggedInUserId) {
      await dispatch(followUser(userId));
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (loggedInUserId) {
      await dispatch(unfollowUser(userId));
    }
  };

  const getRandomUsers = (users: User[], count: number) => {
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  if (loading) return <p>Loading...</p>;
  if (!users.length) return <p>No users found.</p>;

  const randomUsers = getRandomUsers(users, 5);

  return (
    <div className={`w-72 ${darkMode ? 'bg-customBlack':'bg-customWhite'}`}>
      <h1 className={`font-bold rounded-md p-2 flex justify-center items-center ${darkMode ? 'bg-customHoverBlack text-customWhite' : 'bg-customGray'}`}>User Suggestions</h1>
      {randomUsers.map((user) => (
        <div key={user._id} className={`${darkMode ? 'bg-customHoverBlack text-customWhite': 'bg-customGray text-customBlack'} p-2 my-3 rounded-lg flex gap-4`}>
          <div className="w-52">
            <p className='font-bold'>{user.firstName} {user.lastName}</p>
            <p className='text-sm'>{user.email}</p>
          </div>
          {user._id !== loggedInUserId && (
            <div className="">
              <p className='text-3xl text-black'>{user.isFollowing}</p>
              {user.isFollowing ? (
                <Button className='p-1 px-2 m-1' onClick={() => handleUnfollow(user._id)}>Unfollow</Button>
              ) : (
                <Button className='p-1 px-2 m-1' onClick={() => handleFollow(user._id)}>Follow</Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserSuggestions;
