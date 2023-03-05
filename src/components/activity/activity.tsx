import React from 'react';
import { ActivityItem } from '@components/activity/ActivityItem';

interface Activity {
  id: number;
  username: String;
  verb: string;
  name: string;
  network: string;
  releaseDate: string;
  time: string;
}

const activityData: Activity[] = [
  {
    id: 1,
    username: 'jdoe',
    verb: 'added to watchlist',
    name: 'Inception',
    network: 'HBO',
    releaseDate: '2010-07-16',
    time: '2022-02-28 10:00:00'
  },
  {
    id: 2,
    username: 'MikeM',
    verb: 'added to watchlist',
    name: 'Stranger Things',
    network: 'Netflix',
    releaseDate: '2016-07-15',
    time: '2022-02-27 12:00:00'
  },
  {
    id: 3,
    username: 'sarahJoe',
    verb: 'watched',
    name: 'The Dark Knight',
    network: 'Amazon Prime Video',
    releaseDate: '2008-07-18',
    time: '2022-02-26 16:00:00'
  },
  {
    id: 4,
    username: 'jderocks',
    verb: 'added to watchlist',
    name: 'Breaking Bad',
    network: 'Netflix',
    releaseDate: '2008-01-20',
    time: '2022-02-26 10:00:00'
  },
  {
    id: 5,
    username: 'oHiCoolGuy',
    verb: 'watched',
    name: 'Game of Thrones',
    network: 'HBO',
    releaseDate: '2011-04-17',
    time: '2022-02-25 14:00:00'
  },
  {
    id: 6,
    username: 'totallyNotABot',
    verb: 'added to watchlist',
    name: 'The Shawshank Redemption',
    network: 'Amazon Prime Video',
    releaseDate: '1994-09-23',
    time: '2022-02-24 12:00:00'
  },
  {
    id: 6,
    username: 'randomMan',
    verb: 'follows the show',
    name: 'The Last Kingdom',
    network: 'HBO',
    releaseDate: '1994-09-23',
    time: '2022-02-24 12:00:00'
  },
  {
    id: 6,
    username: 'randomMan',
    verb: 'hates the show',
    name: 'The White Lotus',
    network: 'HBO',
    releaseDate: '1994-09-23',
    time: '2022-02-24 12:00:00'
  }
];

const ActivityFeed: React.FC = () => {
  return (
    <div className='dark: rounded-lg bg-white bg-gray-800 p-4 text-light-primary shadow-md dark:text-dark-primary'>
      <h2 className='mb-4 text-lg font-bold'>Activity Feed</h2>
      {activityData.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default ActivityFeed;
