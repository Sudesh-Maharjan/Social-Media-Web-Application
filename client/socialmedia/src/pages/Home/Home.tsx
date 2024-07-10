import { Toaster } from 'sonner';
import Post from '../../components/Post/index';
import Story from '@/components/Story/index';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { clearCurrentStory } from '@/redux/slices/currentStorySlice';

const Index = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isOpen, stories, currentIndex } = useSelector((state: RootState) => state.currentStory);
  const handleClose = () => {
    dispatch(clearCurrentStory());
  };
  return (
    <>
      <Toaster />
      {isOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-75 ">
        <Story elapsedTime={stories[currentIndex]?.elapsedTime} />
      </div>
      )}
      <Post />
      <img src="uploads/" alt="" />
    </>
  );
}

export default Index;
