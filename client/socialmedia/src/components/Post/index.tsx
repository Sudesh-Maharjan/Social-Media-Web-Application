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
//shad cn
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/types";
import ProfileSuggetions from "../ProfileSuggetions";
import '../../../public/css/styles.css'

const PostComponent = () => {
  const dispatch: AppDispatch = useDispatch();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.posts
  );
  const {userId} = useSelector((state: RootState) => state.auth);
  console.log(userId)
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleEdit = (post: Post) => {
    console.log("Editing post:", post._id);
    setContent(post.content);
    setCurrentPostId(post._id);
    setIsEditing(true);
    setShowForm(true);
    setImage(null);
  };
  const handleDelete = (_id: number) => {
    console.log("Deleting post with ID:", _id);
    dispatch(deletePost(_id));
  };

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("handleSubmit:", { isEditing, currentPostId, content });

    const formData = new FormData();
    formData.append("content", content);
    formData.append("status", "published");
    if (image) {
      formData.append("image", image);
    }
    try{
    if (isEditing && currentPostId !== null) {
      // console.log("Updating post with ID:", currentPostId);
      await dispatch(updatePost({id: currentPostId, formData}));
    } else {
      await dispatch(createPost(formData));
    }
    setContent("");
    setImage(null);
    setShowForm(false);
    setIsEditing(false);
    setCurrentPostId(null);
  }catch{
    console.error("Error creating/updating post:", error);
  }
}
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
 const handleLike = (postId: number) => {
    if (userId) {
      dispatch(likePost({ postId }));
    } else {
      console.error('User ID is null.');
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div className="border inline-block m-5 p-2 absolute z-10 rounded-lg shadow-md">
        <div className="flex flex-col gap-5">
      <ProfileSuggetions/>
        <Button
          className="rounded-lg p-4 cursor-pointer"
          onClick={() => setShowForm(!showForm)}
          >
          Post
        </Button>
          </div>
      </div>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        {showForm && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              encType="multipart/form-data" 
              className="bg-white shadow-md rounded-lg p-8 w-96"
            >
              <textarea
                placeholder="Whats n your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:border-blue-500"
                rows={4}
              ></textarea>
                {isEditing && currentPostId !== null && (
    <div className="mb-3">
      <img
        src={posts.find((post) => post._id === currentPostId)?.image || ""}
        alt="Previous Image"
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
                className=" text-white px-4 py-2 rounded-lg transition duration-200"
              >
                {isEditing ? "Update Post" : "Create Post"}
              </Button>
            </form>
          </div>
        )}

        {loading && <p className="mt-4 text-center">Loading...</p>}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}

        <div className="mt-4 w-[600px] scrollable-container" style={{ maxHeight: "600px" }}>
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white shadow-md rounded-lg p-4 mb-4 relative"
            >
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
              <div className="flex flex-col">
                  <h4 className="text-sm font-semibold">{post.creatorName}</h4>
                  <small className="text-gray-500">
                    {post.formattedCreateDate}
                  </small>
                </div>
              <p className="text-gray-700">{post.content}</p>
              {
              post.image && (
                
                     <img src={`${post.image}`} alt="Post" className="w-full h-auto mt-2" />
                   )}
              <div className="flex justify-between mt-4">
              <button onClick={() => handleLike(post._id)}>
  {userId && post.likes.includes(userId) ? 'Unlike' : 'Like'} ({post.likes.length})
</button>
                <button className="text-gray-600 hover:text-gray-800 flex items-center">
                  <FaRegComment className="mx-1" />
                  Comment
                </button>
                <button className="text-gray-600 hover:text-gray-800 flex items-center">
                  <IoShareSocial className="mx-1" />
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PostComponent;
