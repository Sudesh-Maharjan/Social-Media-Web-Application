import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStories } from '../../redux/slices/storySlice';
import Story from './index';
import { AppDispatch, RootState } from '@/redux/store';
import { Card, CardContent } from "@/components/ui/card"
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
  return (
    <>
      <Button className='rounded-full text-3xl p-1' onClick={handleAddClick}><IoAddOutline /></Button>
      {showUploader && (
        <Uploader />
      )}
    <div className="border p-2 rounded-lg z-10">
      <Carousel
      opts={{
        align: "start",
      }}
      className=""
    >
      <CarouselContent>
      {stories.map((story, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                <Card className='h-full'>
                  <div className="flex items-center justify-center h-full">
                    <Story key={story._id} story={story} />
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
