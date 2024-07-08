import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserDetails,
  selectUsersLoading,
  selectCurrentUser,
  followUser,
  unfollowUser,
  selectUsers
} from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { User, Post } from "@/types";
import { MdOutlineMail, MdOutlineVerified } from "react-icons/md";
import "../../../public/css/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { deleteProfilePicture, selectProfilePictureUrl, uploadProfilePicture } from "@/redux/slices/profileSlice";
const ProfilePage: React.FC = React.memo(() => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const loading = useSelector<RootState, boolean>(selectUsersLoading);
  const currentUser = useSelector(selectCurrentUser);
  //putting logged in users id in state for conditional rendering of profile page.
  const [loggedInUserId, setLoggedInUserId] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
 const profilePictureUrl = useSelector(selectProfilePictureUrl);
  useEffect(() => {
    const userData = localStorage.getItem("userId");
    if (userData) {
      try {
        setLoggedInUserId(userData);
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
    if(userId){
      dispatch(fetchUserDetails({ _id: userId }));

    }else if(loggedInUserId){
      dispatch(fetchUserDetails({_id: loggedInUserId}));
    }else{
      console.error("No user id provided");
      navigate("/home");
    }
  }, [dispatch, userId, loggedInUserId, navigate]);

  const handleUploadPicture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePicture", file);
      dispatch(uploadProfilePicture(formData));
    }
  };

  const handleDeletePicture = () => {
    dispatch(deleteProfilePicture());
  };

  const handleFollow = () => {
    if (currentUser && loggedInUserId) {
      dispatch(followUser(currentUser._id));
    }
  };
  
  const handleUnfollow = () => {
    if (currentUser && loggedInUserId) {
      dispatch(unfollowUser(currentUser._id));
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        No user data
      </div>
    );
  }
  const isOwnProfile = currentUser._id === loggedInUserId;


  return (
    <>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="text-center mb-8 flex justify-center flex-col items-center">
          <div 
              className="rounded-full w-56 h-56 bg-slate-300 hover:cursor-pointer hover:opacity-85 flex justify-center items-center"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  console.log("File input ref is null");
                }
              }}
            >
              {currentUser.profilePicture || profilePictureUrl ? (
                <img src={currentUser.profilePicture || profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <>
                Click to upload
                <input
                type="file"
                id="upload-photo"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUploadPicture}
                className="hidden"
              />
                </>
              )}
            </div>
              
              <button onClick={handleDeletePicture}>Delete</button>
            <h1 className="text-3xl font-bold mt-7 mb-2">{`${currentUser.firstName} ${currentUser.lastName}`}</h1>
            {!isOwnProfile && (
              <div className="mt-4">
                {currentUser.followers.some(follower => follower._id === loggedInUserId) ? (
                  <Button
                    onClick={handleUnfollow}
                    className=" text-white px-4 py-2 rounded-3xl"
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    className=" text-white px-4 py-2 rounded-3xl"
                  >
                    Follow
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-start flex-col items-start p-3 gap-3">
            <div className="flex justify-center gap-3">
              <MdOutlineMail className="text-3xl pt-1" />
              <p className=" flex flex-col text-lg">
                {currentUser.email}
                <span className="text-slate-500 text-sm">Email</span>
              </p>
            </div>
            <div className="flex gap-3">
              <MdOutlineVerified className="text-3xl pt-1" />
              <div>
                <p className="flex flex-col text-lg">
                  {currentUser.isVerified ? "Verified" : "Not Verified"}
                </p>
                <div className="text-slate-500 text-sm">
                  Verification Status
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-600 mt-6 p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-semibold">Followers</h2>
              <span className="text-gray-400">
                {currentUser.followers.length}
              </span>
            </div>
            <ul
              className="list-disc list-inside scrollable-container"
              style={{ maxHeight: "50px" }}
            >
              {currentUser.followers.length > 0 ? (
                currentUser.followers.map((follower: User) => (
                  <li
                    key={follower._id}
                    className="text-gray-300"
                  >{`${follower.firstName} ${follower.lastName}`}</li>
                ))
              ) : (
                <li className="text-gray-300">No followers</li>
              )}
            </ul>
          </div>
          <div className="border border-gray-600 mt-6 p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-semibold">Following</h2>
              <span className="text-gray-400">
                {currentUser.following.length}
              </span>
            </div>
            <ul
              className="list-disc list-inside scrollable-container"
              style={{ maxHeight: "50px" }}
            >
              {currentUser.following.length > 0 ? (
                currentUser.following.map((followee: User) => (
                  <li
                    key={followee._id}
                    className="text-gray-300"
                  >{`${followee.firstName} ${followee.lastName}`}</li>
                ))
              ) : (
                <li className="text-gray-300">Not following anyone</li>
              )}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Liked Posts</h2>
            <ul className="list-disc list-inside">
              {currentUser.likedPosts.length > 0 ? (
                currentUser.likedPosts.map((post: Post) => (
                  <li key={post._id} className="text-gray-300">
                    {post.content}
                  </li>
                ))
              ) : (
                <li className="text-gray-300">No liked posts</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
});

export default ProfilePage;
