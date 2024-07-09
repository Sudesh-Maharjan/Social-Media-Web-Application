import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStories } from '../../redux/slices/storySlice';
import Story from './index';
import { AppDispatch, RootState } from '@/redux/store';

const StoryList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { stories, loading, error } = useSelector((state: RootState) => state.stories);
console.log('Stories:', stories);
  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="border w-[250px] z-10">
      {stories.map((story) => (
        <Story key={story._id} story={story} />
      ))}
    </div>
  );
};

export default StoryList;
