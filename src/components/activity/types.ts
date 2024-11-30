export interface SearchResult {
    id: number;
    title: string;
    releaseDate: string;
    overview: string;
    poster_path: string;
    vote_average: number;
    name: string;
    status: string;
  }


  export interface ViewingActivity {
    tmdbId: string;
    id: number;
    username: string;
    title: string;
    status: string;
    rating: string;
    review: string;
    network: string;
    poster_path: string;
    backdrop_path?: string;
    releaseDate: string;
    time: string;
    photoURL: string;
    mediaType: 'movie' | 'tv';
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

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  media_type: 'movie' | 'tv' | 'person';
}

export interface TMDBResponse {
  page: number;
  results: TMDBResult[];
  total_pages: number;
  total_results: number;
}