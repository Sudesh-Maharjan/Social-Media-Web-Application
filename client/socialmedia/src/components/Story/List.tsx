import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStories } from '../../redux/slices/storySlice';
import { setCurrentStory } from '../../redux/slices/currentStorySlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '../ui/button';
import { IoAddOutline } from "react-icons/io5";
import Uploader from './Uploader';

const StoryList = () => {
  const [showUploader, setShowUploader] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const { stories, loading, error } = useSelector((state: RootState) => state.stories);

  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleAddClick = () => {
    setShowUploader((prevShowUploader) => !prevShowUploader);
  };

  const handleClickStory = (index: number) => {
    dispatch(setCurrentStory({ stories, index }));
  };

  return (
    <>
      <Button className='rounded-full text-3xl p-1' onClick={handleAddClick}><IoAddOutline /></Button>
      {showUploader && (
        <Uploader />
      )}
      <div className="border p-2 rounded-lg z-10">
        <Carousel opts={{ align: "start" }} className="">
          <CarouselContent>
            {stories.map((story, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                <Card className='h-full'>
                  <div className="flex items-center justify-center h-full" onClick={() => handleClickStory(index)}>
                    <div className="w-[170px] h-[260px]">
                      {story.mediaType === 'image' ? (
                        <img src={story.mediaUrl} alt="Story" className="object-cover rounded-lg cursor-pointer transition duration-700 hover:border-2 h-full w-full" />
                      ) : (
                        <video src={story.mediaUrl} controls className="w-full h-full mb-2" />
                      )}
                      <p className="absolute bottom-2 font-bold text-customWhite m-2">{story.user.firstName} {story.user.lastName}</p>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  );
};

export default StoryList;
