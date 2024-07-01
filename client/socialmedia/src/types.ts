export interface ThemeState {
   darkMode: boolean;
}
export interface AppState{
   theme: ThemeState;
}
export interface Post {
_id: string;
content: string;
image: string;
likes: string[];
userId: string;
creatorName: string;
formattedCreateDate: string;
comments: Comment[];
}
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isFollowing: boolean;
   followers: User[];
   following: User[];
   likedPosts: Post[];
}

export interface Comment {
   _id: string;
   postId: string;
   comment: string;
   author: User;
   createDate: string; 
   updateDate?: string;
 }

 export interface Notification {
   _id: string;
   recipient: string;
   message: string;
   type: string;
   createdAt: string;
   read: boolean;
 }