export interface SearchResult {
    id: number;
    title: string;
    releaseDate: string;
    overview: string;
    poster_path: string | null;
    vote_average: number;
    name: string;
  }


  export interface ViewingActivity {
    tmdbId: string;
    title: string;
    status: string;
    rating: string;
    review: string;
  }