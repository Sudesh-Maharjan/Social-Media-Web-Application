import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
} from "../../redux/slices/postSlice";
import { RootState, AppDispatch } from "@/redux/store";
import { Button } from "../ui/button";
import { FaRegComment } from "react-icons/fa";
import { IoShareSocial } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppState, Post } from "@/types";
import '../../../public/css/styles.css';
import CommentComponent from "../Comment/Comment"; 
import { useNavigate } from "react-router-dom";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import List from '../../components/Story/List'
const PostComponent = () => {
  const darkMode = useSelector((state: AppState) => state.theme.darkMode);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const users = useSelector((state: RootState) => state.users.users);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  //create post or update post form
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState<{ [key: string]: boolean }>({});
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [profilePicture, setProfilePicture] = useState('');
  const [firstName, setFirstName] = useState('');
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      const likedPostsIds = posts.filter(post => post.likes.includes(userId)).map(post => post._id);
      setLikedPosts(likedPostsIds);
    }
  }, [posts, userId]);
  const handleEdit = (post: Post) => {
    setContent(post.content);
    setCurrentPostId(post._id);
    setIsEditing(true);
    setShowForm(true);
    setImage(null);
  };

  const handleDelete = (postId: string) => {
    dispatch(deletePost(postId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    formData.append("status", "published");
    if (image) {
      formData.append("image", image);
    }

    try {
      if (isEditing && currentPostId !== null) {
        await dispatch(updatePost({ postId: currentPostId, formData }));
      } else {
        await dispatch(createPost(formData));
      }
      setContent("");
      setImage(null);
      setShowForm(false);
      setIsEditing(false);
      setCurrentPostId(null);
    } catch {
      console.error("Error creating/updating post:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(e.target as Node)) {
      setShowForm(false);
      setIsEditing(false);
      setCurrentPostId(null);
    }
  };

  const handleLike = (postId: string) => {
    dispatch(likePost(postId));
    //imeediately update the liked posts
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
    
  };

  const handleCommentClick = (postId: string) => {
    setShowCommentInput(prev => ({ ...prev, [postId]: !prev[postId] })); //gets the previous state of comment input open or close then toggles opposite to that input
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handlePhotoClick = (postId: string) => {
    navigate(`/posts/${postId}`);
  }
  const renderLikedUsers = (post: Post) => {
    if (!post.likes.length) return null;

    const likedUsers = users.filter(user => post.likes.includes(user._id));
    
    return (
      <div className="flex items-center space-x-2 text-sm my-2">
        <span className="text-slate-500">
        <HoverCard>
          <HoverCardTrigger className="hover:underline hover:cursor-pointer">
          {likedUsers.length} {likedUsers.length > 1 ? 'people' : 'person'}
          </HoverCardTrigger>
          <HoverCardContent className="bg-black text-white text-sm">
            {likedUsers.map(user => (
              <div key={user._id}>
                {user.firstName} {user.lastName}
              </div>
            ))}
          </HoverCardContent>
        </HoverCard>
          <span> liked your post</span></span>
      </div>
    );
  };
  useEffect(() => {
    const userData = localStorage.getItem('User_data');
    if(userData){
       const user = JSON.parse(userData);
       setProfilePicture(user.profilePicture);
       setFirstName(user.firstName);
    }
      }, []);
  return (<>
    <div className={` flex flex-col items-center justify-center  ${darkMode ? 'bg-customBlack' : 'bg-customWhite'}`}>
      <div className="w-[700px] my-4">
    <List/>
    </div>
    {showForm && (
          <div className="absolute top-20 left-0 w-full h-full bg-gray-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="bg-white shadow-md rounded-lg p-8 h-full w-[570px]"
            >
              <textarea
                placeholder={`What's on your mind... ${firstName} ?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:border-blue-500"
                rows={4}
              ></textarea>
              {image && (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Selected Image"
                    className="w-full h-auto mt-2"
                  />
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-3"
              />
              <Button
                type="submit"
                className="text-customWhite px-4 py-2 rounded-lg transition duration-200"
              >
                {isEditing ? "Update Post" : "Create Post"}
              </Button>
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setCurrentPostId(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </form>
          </div>
        )}

      {loading && <p className="mt-4 text-center">Loading...</p>}
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      <div className="">
<h1 className="font-bold text-xl">Posts</h1>
        <div className={` rounded-md p-3 m-2 ${darkMode ? 'border border-customHoverBlack':'border'}`}>
<div className="flex gap-5 " onClick={() => setShowForm(!showForm)}>
<img
                  className="h-10 w-10 cursor-pointer hover:opacity-85 transition duration-100 rounded-full object-cover"
                  src={profilePicture}
                  alt="Profile"
                />
  <input type="text" className={` rounded-full h-10 ${darkMode ? 'bg-customHoverBlack hover:bg-customSoftBlack': 'bg-slate-100 hover:bg-slate-200'}  px-2 w-full  transition duration-200`} placeholder={`What's on your mind... ${firstName} ?`} />
        
      </div>
      </div>
      <div className={`mt-4 w-[680px] scrollable-container ${darkMode ? 'border-x-2 border-customHoverBlack': 'border-x-2  '} px-4`} style={{ maxHeight: "600px" }}>
        {posts.map((post) => (
          <div key={post._id} className={` ${darkMode ? 'bg-customBlack text-white' : 'bg-customWhite'} rounded-lg p-4 mb-4`}>
            <div className={`border p-3 rounded-md shadow-md relative ${darkMode ? 'border-customHoverBlack':'border-customGray'}`}>
            <div className="absolute top-1 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger>•••</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(post)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(post._id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex ">
            <img
                  src={post.creatorID.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 transition duration-100 rounded-full mr-2 cursor-pointer hover:opacity-85"
                />
                <div className="flex flex-col">
                  <a href="/" className="hover:underline">
              <h4 className="text-sm font-semibold">{post.creatorName}</h4>
              </a>
              <small className={` ${darkMode ? ' text-slate-400' : 'text-slate-500'} text-sm`}>{post.formattedCreateDate}</small>
              </div>
            </div>
            <p className="text-gray-700">{post.content}</p>
            {post.image && (
              <img src={`${post.image}`} alt="Post" className="w-full h-[600px] mt-2 object-cover cursor-pointer" onClick={() => handlePhotoClick(post._id)} />
            )}
            {renderLikedUsers(post)}
            <div className={`flex justify-between mt-2 border-y-2 ${darkMode ? 'border-customHoverBlack':'border-customGray'}`}>

            <button onClick={() => handleLike(post._id)} className="text-md flex items-center justify-center gap-1">
                  {userId && likedPosts.includes(post._id)  ? (
                    <>
                      <AiFillLike className="text-xl font-bold" /> Liked
                    </>
                  ) : (
                    <>
                      <AiOutlineLike className="text-xl" /> Like
                    </>
                  )}
                </button>
              <button className="text-gray-600 hover:text-gray-800 flex items-center hover:bg-slate-100 p-2 transition duration-300 rounded-md" onClick={() => handleCommentClick(post._id)}>
                <FaRegComment className="mx-1" />
                Comment
              </button>
              <button className="text-gray-600 hover:text-gray-800 flex items-center">
                <IoShareSocial className="mx-1" />
                Share
              </button>
            </div>
            </div>
            {showCommentInput[post._id] && (
              <CommentComponent postId={post._id} comments={post.comments} />
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  
  </>);
};

export default PostComponent;
