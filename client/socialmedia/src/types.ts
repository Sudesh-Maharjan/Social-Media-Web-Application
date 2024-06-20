export interface ThemeState {
   darkMode: boolean;
}
export interface AppState{
   theme: ThemeState;
}
export interface Post {
_id: number;
content: string;
}