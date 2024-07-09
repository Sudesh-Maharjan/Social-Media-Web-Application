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
    <div className=" p-2 ">
      {story.mediaType === 'image' ? (
        <img src={story.mediaUrl} alt="Story" className="object-cover rounded-lg cursor-pointer transition duration-300 hover:border-2 mb-2 h-[260px] w-[170px]" />
      ) : (
        <video src={story.mediaUrl} controls className="w-full h-auto mb-2" />
      )}
      <p className="mb-2">{story.user.firstName} {story.user.lastName}</p>
      {/* <button onClick={handleDelete} className="bg-red-500 text-white py-1 px-2 rounded">
        Delete
      </button> */}
    </div>
  );
};

export default Story;
