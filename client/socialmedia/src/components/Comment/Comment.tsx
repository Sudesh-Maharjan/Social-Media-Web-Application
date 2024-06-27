import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment, deleteComment, fetchComments, updateComment } from '../../redux/slices/commentSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Button } from '../ui/button';
import { IoSend } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';
import { Comment } from '@/types';
import '../../../public/css/styles.css';
import moment from 'moment';
import { FaEdit } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { FaCheck } from "react-icons/fa6";
interface CommentComponentProps {
  postId: string;
  comments: Comment[];
}

const CommentComponent: React.FC<CommentComponentProps> = ({ postId }) => {
  const dispatch: AppDispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const comments = useSelector((state: RootState) => state.comment.comments[postId] || []);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleAddComment = () => {
    if (newComment.trim() === '') return;

    dispatch(addComment({ postId, content: newComment })).then(() => {
      setNewComment('');
    }).catch(error => {
      console.error('Failed to add comment:', error);
    });
  };

  const handleEditComment = (comment: Comment) => {
    setEditCommentId(comment._id);
    setEditCommentText(comment.comment);
  };

  const handleUpdateComment = (commentId: string) => {
    if (editCommentText.trim() === '') return;
    dispatch(updateComment({ postId, commentId, content: editCommentText })).then(() => {
      setEditCommentId(null);
      setEditCommentText('');
    }).catch(error => {
      console.error('Failed to update comment:', error);
    });
  };
  const handleDeleteComment = (commentId: string) => {
    dispatch(deleteComment({ postId, commentId })).then(() => {
    }).catch(error => {
      console.error('Failed to delete comment:', error);
    });
  };

  const renderComment = (comment: Comment) => {
    if (editCommentId === comment._id) {
      return (
        <div key={comment._id} className="rounded-lg flex justify-between items-start flex-col">
            <p className="text-gray-700 text-sm"><strong>{comment.author.firstName} {comment.author.lastName}</strong> </p>
          <input
            value={editCommentText}
            onChange={(e) => setEditCommentText(e.target.value)}
            className="w-full p-1 border rounded-lg focus:outline-none focus:border-black"
          ></input>
          <div className="flex">
            <button onClick={() => handleUpdateComment(comment._id)} className="ml-2 hover:bg-slate-100 transition duration-300 text-sm p-1">
            <FaCheck />
            </button>
            <button onClick={() => setEditCommentId(null)} className="ml-2 p-1 h-7 hover:bg-slate-100 transition duration-300 text-sm">
            <RxCross2 />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div key={comment._id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-start flex-col">
          <div className='border bg-slate-100 p-1 mb-1 rounded-md'>
            <p className="text-gray-700 text-sm"><strong>{comment.author.firstName} {comment.author.lastName}</strong></p>
            <p>{comment.comment}</p>
          </div>
          <div className="">
            <small className="text-slate-600">{moment(comment.createDate).fromNow()}</small>
            {comment.author._id === userId && (
              <div className="flex mt-2">
                <button onClick={() => handleEditComment(comment)} className="text-black hover:text-green-500 transition duration-200 mx-2">
                <FaEdit />
                </button>
                <button onClick={() => handleDeleteComment(comment._id)} className="text-black hover:text-red-500 transition duration-200 mx-2 text-sm">
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  };
  return (
    <div className="mt-1 shadow-md p-3">
      <h3 className=" font-semibold mb-2 text-slate-500">Comments</h3>
      <ul className="space-y-4 scrollable-container" style={{ maxHeight: "200px" }}>
      {comments.map((comment) => (
          <li key={comment._id}>
            {renderComment(comment)}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex">
        <input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full px-3 border rounded-lg focus:outline-none focus:border-black"
        ></input>
        <Button onClick={handleAddComment} className="ml-2">
          <IoSend />
        </Button>
      </div>
    </div>
  );
};

export default CommentComponent;
