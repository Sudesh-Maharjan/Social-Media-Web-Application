import { Toaster } from 'sonner'
import Post from '../../components/Post/index';
import Story from '../../components/Story/Uploader'
import List from '../../components/Story/List'

const index = () => {
  return (
    <>
    <Toaster/>
    <div className="flex justify-center">
    <div className=" flex justify-center p-4 rounded-lg m-3 w-[500px] gap-3">
    <Story/>
    <List/>
    </div>
    </div>
      <Post/>
      <img src="uploads/" alt="" />
    </>
  )
}

export default index
