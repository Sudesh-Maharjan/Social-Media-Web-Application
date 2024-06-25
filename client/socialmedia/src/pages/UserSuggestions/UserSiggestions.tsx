import {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser, selectUsers, selectUsersLoading, fetchUsers } from '../../redux/slices/userSlice';
import { AppDispatch } from '@/redux/store';
import { User } from '@/types';
const UserSuggestions = () => {
  const dispatch: AppDispatch = useDispatch();
  const users: User[] = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);

   useEffect(() =>{
     dispatch(fetchUsers());
   }, [dispatch])

   const handleFollow = async(userIdToFollow: string) => {
     await dispatch(followUser(userIdToFollow));
   }
   const handleUnfollow = async (userIdToUnfollow: string) => {
   await dispatch(unfollowUser(userIdToUnfollow));
    };
    if (loading) return <p>Loading...</p>;
    if (!users.length) return <p>No users found.</p>;
  return (
    <>
    <div>
      <h1>Follow/Unfollow Users</h1>
      {users.map((user) => (
        <div key={user._id}>
          <p>{user.firstName} {user.lastName}</p>
          {user.isFollowing ? (
            <button onClick={() => handleUnfollow(user._id)}>Unfollow</button>
          ) : (
            <button onClick={() => handleFollow(user._id)}>Follow</button>
          )}
        </div>
      ))}
    </div>
    </>
  )
}

export default UserSuggestions
