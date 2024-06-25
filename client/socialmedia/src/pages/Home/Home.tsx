import { Toaster } from 'sonner'
import Header from '../../components/Header/index'
import Post from '../../components/Post/index'
import Chat from '@/components/Chat/Chat'
const index = () => {
  return (
    <>
    <Toaster/>
      <Header/>
      <Post/>
      <img src="uploads/" alt="" />
      <Chat/>
    </>
  )
}

export default index
