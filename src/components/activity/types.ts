export interface SearchResult {
    id: number;
    title: string;
    releaseDate: string;
    overview: string;
    poster_path: string;
    vote_average: number;
    name: string;
  }


  export interface ViewingActivity {
    tmdbId: string;
    id: number;
    username: string;
    title: string;
    status: string | 'is watching';
    rating: string;
    review: string;
    network: string;
    poster_path: string | 'https://plchldr.co/i/500x250';
    releaseDate: string;
    time: string;
    photoURL: string;
  }

  export interface Activity {
    id: number;
    username: string;
    status: string;
    name: string;
    network: string;
    releaseDate: string;
    time: string;
  }