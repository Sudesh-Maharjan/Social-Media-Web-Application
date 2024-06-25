export interface ThemeState {
   darkMode: boolean;
}
export interface AppState{
   theme: ThemeState;
}
export interface Post {
_id: number;
content: string;
image: string;
likes: string;
userId: string;
creatorName: string;
formattedCreateDate: string;
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