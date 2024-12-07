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


  export type ViewingActivity = {
    tmdbId: string;
    title: string;
    poster_path: string;
    mediaType?: 'movie' | 'tv';
    status: string;
    review?: string;
    overview?: string;
    username: string;
    photoURL: string;
    network?: string;
    releaseDate?: string;
    tags?: string[];
    viewingTags?: string[];
    time?: string;
  };

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