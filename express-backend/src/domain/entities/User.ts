export interface User {
  id: string;
  email: string;
  password: string;
  favourites: UserFavourites;
}

export interface UserFavourites {
  stops: number[];
  lines: number[];
  vehicles: number[];
}
