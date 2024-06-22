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