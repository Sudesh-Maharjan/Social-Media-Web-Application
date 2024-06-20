import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
} from "../../redux/slices/postSlice";
import { RootState, AppDispatch } from "@/redux/store";
import { Button } from "../ui/button";
import { AiFillLike } from "react-icons/ai";
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
const PostComponent = () => {
  const dispatch: AppDispatch = useDispatch();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.posts
  );
  const [content, setContent] = useState("");
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
  };
  const handleDelete = (_id: number) => {
    console.log("Deleting post with ID:", _id);
    dispatch(deletePost(_id));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit:", { isEditing, currentPostId, content });
    if (isEditing && currentPostId !== null) {
      console.log("Updating post with ID:", currentPostId);
      dispatch(updatePost({ id: currentPostId, content }));
    } else {
      dispatch(createPost({ content, status: "published" }));
    }
    setContent("");
    setShowForm(false);
    setIsEditing(false);
    setCurrentPostId(null);
  };
  const handleOutsideClick = (e: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(e.target as Node)) {
      setShowForm(false);
      setIsEditing(false);
      setCurrentPostId(null);
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
      <div className="">
        <Button
          className="rounded-lg p-4 cursor-pointer"
          onClick={() => setShowForm(!showForm)}
        >
          Post
        </Button>
      </div>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        {showForm && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded-lg p-8 w-96"
            >
              <textarea
                placeholder="Whats n your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:border-blue-500"
                rows={4}
              ></textarea>
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

        <div className="mt-4 w-[600px]">
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
              <p className="text-gray-700">{post.content}</p>
              <div className="flex justify-between mt-4">
                <button className="text-gray-600 hover:text-gray-800 flex items-center">
                  <AiFillLike className="mx-1" />
                  Like
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
