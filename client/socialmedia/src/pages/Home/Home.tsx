import { Toaster } from 'sonner'
import Header from '../../components/Header/index'
import Post from '../../components/Post/index'
const index = () => {
  return (
    <>
    <Toaster/>
      <Header/>
      <Post/>
      <img src="uploads/" alt="" />
    </>
  )
}

export default index
