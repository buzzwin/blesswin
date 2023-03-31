import React from 'react';
import { ActivityItem } from '@components/activity/ActivityItem';
import { ViewingActivity } from './types';
import { Timestamp } from 'firebase/firestore';
const randomNumber = Math.floor(Math.random() * 16);
const activityData: ViewingActivity[] = [
  {
    id: 1,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'jdoe',
    status: 'loved',
    title: 'Inception',
    network: 'HBO',
    releaseDate: '2010-07-16',
    time: '2022-02-28 10:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  },
  {
    id: 2,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'MikeM',
    status: 'loved',
    title: 'Stranger Things',
    network: 'Netflix',
    releaseDate: '2016-07-15',
    time: '2022-02-27 12:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  },
  {
    id: 3,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'sarahJoe',
    status: 'watched',
    title: 'The Dark Knight',
    network: 'Amazon Prime Video',
    releaseDate: '2008-07-18',
    time: '2022-02-26 16:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  },
  {
    id: 4,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'jderocks',
    status: 'started watching',
    title: 'Breaking Bad',
    network: 'Netflix',
    releaseDate: '2008-01-20',
    time: '2022-02-26 10:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  },
  {
    id: 5,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'oHiCoolGuy',
    status: 'finished watching',
    title: 'Game of Thrones',
    network: 'HBO',
    releaseDate: '2011-04-17',
    time: '2022-02-25 14:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  },
  {
    id: 11,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'totallyNotABot',
    status: 'watched',
    title: 'The Shawshank Redemption',
    network: 'Amazon Prime Video',
    releaseDate: '1994-09-23',
    time: '2022-02-24 12:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  },
  {
    id: 6,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'randomMan',
    status: 'loved',
    title: 'The Last Kingdom',
    network: 'HBO',
    releaseDate: '1994-09-23',
    time: '2022-02-24 12:00:00',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
  },
  {
    id: 7,
    tmdbId: '',
    rating: '',
    review: '',
    username: 'randomMan',
    status: 'hates the show',
    title: 'The White Lotus',
    network: 'HBO',
    releaseDate: '1994-09-23',
    time: '2022-02-24 12:00:00',
    poster_path:
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    photoURL:
      'https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}'
  }
];

const ActivityFeed: React.FC = () => {
  return (
    <div className='float-left rounded-lg p-2 text-light-primary shadow-md dark:bg-gray-800 dark:text-dark-primary'>
      <h2 className='mb-4 text-lg font-bold'>Activity Feed</h2>
      {activityData.map((activity) => (
        <div className='p-4' key={activity.id}>
          <ActivityItem
            activity={activity}
            user={{
              id: '',
              bio: null,
              name: '',
              theme: null,
              accent: null,
              website: null,
              location: null,
              username: '',
              photoURL: '',
              verified: false,
              following: [],
              followers: [],
              createdAt: new Timestamp(20000, 0),
              updatedAt: Timestamp.now(),
              totalTweets: 0,
              totalPhotos: 0,
              pinnedTweet: null,
              coverPhotoURL: null
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
