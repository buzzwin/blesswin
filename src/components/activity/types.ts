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
    title: string;
    status: string | 'is watching';
    rating: string;
    review: string;
    poster_path: string | 'https://plchldr.co/i/500x250';
  }