// import { useDispatch } from 'react-redux';
// import { deleteStory } from '../../redux/slices/storySlice';
import { StoryData } from '@/types';
// import { AppDispatch } from '@/redux/store';

const Story = ({ story }: { story: StoryData }) => {
  // const dispatch: AppDispatch = useDispatch();

  // const handleDelete = () => {
  //   dispatch(deleteStory(story._id));
  // };

  return (
    <div className="relative  w-[170px]  h-[260px]">
      {story.mediaType === 'image' ? (
        <img src={story.mediaUrl} alt="Story" className="object-cover rounded-lg cursor-pointer transition duration-700 hover:border-2 h-full w-full" />
      ) : (
        <video src={story.mediaUrl} controls className="w-full h-full mb-2" />
      )}
      <p className="absolute bottom-2 font-bold text-customWhite m-2">{story.user.firstName} {story.user.lastName}</p>
      {/* <button onClick={handleDelete} className="bg-red-500 text-white py-1 px-2 rounded">
        Delete
      </button> */}
    </div>
  );
};

export default Story;
