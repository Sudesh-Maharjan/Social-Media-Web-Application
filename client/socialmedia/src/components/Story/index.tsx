import { clearCurrentStory, nextStory } from '@/redux/slices/currentStorySlice';
import { deleteStory } from '../../redux/slices/storySlice';
import { AppDispatch, RootState } from '@/redux/store';
import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import '../../../public/css/styles.css';
import Loader from '../Loader/index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
interface StoryProps {
  elapsedTime: string;
}

const Story = ({ elapsedTime }: StoryProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { stories, currentIndex, isOpen } = useSelector((state: RootState) => state.currentStory);

  const story = stories[currentIndex];
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isOpen && stories.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        dispatch(nextStory());
        setIsLoading(true);
      }, 10000); // Change story every 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentIndex, dispatch, stories.length]);

  const handleDelete = () => {
    if (story) {
      dispatch(deleteStory(story._id));
      dispatch(clearCurrentStory());
    }
  };

  if (!story) {
    return null; // or you can return some fallback UI here
  }

  return (
    
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="story-popup"
      unmountOnExit
    >
        <div className=" flex items-center justify-center bg-black bg-opacity-75 w-[400px] h-[600px] rounded-xl">
          <div className="relative">
          {isLoading && <Loader />}
            <button
              onClick={() => dispatch(clearCurrentStory())}
              className="absolute top-3 right-2 text-customGray"
            >
              <IoClose size={24} />
            </button>
            <div className="absolute top-3 left-2 text-customGray">{elapsedTime}</div>
            {story.mediaType === 'image' ? (
              <img src={story.mediaUrl} alt="Story" className="max-w-full max-h-full " />
            ) : (
              <video src={story.mediaUrl} controls className="max-w-full max-h-full" />
            )}
            <div className="flex justify-end">
             <DropdownMenu>
                <DropdownMenuTrigger className='text-customGray px-2'>•••</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className='bg-customGray text-customBlack p-1 rounded-md cursor-pointer'>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            {/* <button
              onClick={handleDelete}
              className="absolute bottom-2 right-2 bg-red-500 text-white py-1 px-2 rounded"
            >
              Delete
            </button> */}
          </div>
        </div>
      </CSSTransition>
  );
};

export default Story;
