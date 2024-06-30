import CommentComponent from "@/components/Comment/Comment";
import { deletePost, fetchPostDetails, likePost } from "@/redux/slices/postSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { FaRegComment } from "react-icons/fa";
import { IoShareSocial } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from '../../components/Header/index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const PostDetails: React.FC = () => {
   const navigate = useNavigate();
   const {postId} = useParams<{postId: string}>();
   const dispatch: AppDispatch = useDispatch();
   const userId = useSelector((state:RootState) => state.auth.userId);
   const post = useSelector((state: RootState) =>
   state.posts.posts.find((p) => p._id === postId));

   useEffect(() => {
      if(postId){
         dispatch(fetchPostDetails(postId))
      }
   }, [dispatch, postId]);

   if(!post){
      return <div> Loading...</div>
   }

  const handleDelete = () => {
    if (postId) {
      dispatch(deletePost(postId));
      navigate("/home"); // Redirect to home after deleting
    }
  };
//   const handleEdit = () => {
//    // Add your edit logic here, probably navigate to an edit page or show a form
//  };
   const handleLike = () => {
      if (userId && postId) {
        dispatch(likePost(postId));
      }
    };
  return (
    <>
    <Header/>
      <div className="flex">
      <div className=" w-full  shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between m-3">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800 hover:bg-slate-200 rounded-full text-3xl px-3 transition duration-300">
              &times;
            </button>
          </div>
        <div className="flex justify-center items-start gap-20 border p-3" >
          <div className="">
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger>•••</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem onClick={handleEdit}>
                    Edit
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={handleDelete}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <img src={post.image} alt="Post" className="w-[650px] h-[550px] object-cover" />
          </div>
          <div className="w-1/3 p-4 flex flex-col border rounded-lg bg-white">
            <div className="mb-4">
              <h2 className=" font-semibold">{post.creatorName}</h2>
              <small className="text-gray-500">{post.formattedCreateDate}</small>
              <p className="text-gray-600">{post.content}</p>
            </div>
            <div className="flex justify-between mt-4 border-b-2 mb-1">
                <button onClick={handleLike}>
                  {userId && post.likes.includes(userId) ? 'Unlike' : 'Like'} ({post.likes.length})
                </button>
                <button className="text-gray-600 hover:text-gray-800 flex items-center hover:bg-slate-100 p-2 transition duration-300 rounded-md">
                  <FaRegComment className="mx-1" />
                  Comment
                </button>
                <button className="text-gray-600 hover:text-gray-800 flex items-center">
                  <IoShareSocial className="mx-1" />
                  Share
                </button>
              </div>
            <div className="flex-grow bg-white rounded-lg">
              <CommentComponent postId={post._id} comments={post.comments} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default PostDetails
