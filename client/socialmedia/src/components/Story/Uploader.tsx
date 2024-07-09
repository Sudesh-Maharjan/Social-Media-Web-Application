import { useState, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { addStory } from '../../redux/slices/storySlice';
import { AppDispatch } from '@/redux/store';

const Uploader = () => {
  const dispatch: AppDispatch = useDispatch();
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]  || null;
    setMedia(file);
    setMediaType(file && file.type.startsWith('image') ? 'image' : 'video');
  };

  const handleUpload = () => {
    if(media){
      const storyData = {
        mediaUrl: media,
        mediaType: mediaType,
      };
      dispatch(addStory(storyData));
    } else{
console.error("No file selected")
    }
  };

  return (
    <div className=" bg-black p-4 rounded-lg absolute z-10 transition-transform duration-300">
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} className='mb-2'/>
      <button onClick={handleUpload} className="bg-customHoverBlack text-white py-2 px-4 rounded">
        Upload
      </button>
    </div>
  );
};

export default Uploader;
