interface Activity {
  id: number;
  username: string;
  verb: string;
  name: string;
  network: string;
  releaseDate: string;
  time: string;
}

export const ActivityItem: React.FC<{ activity: Activity }> = ({
  activity
}) => {
  const {
    verb: id,
    username,
    verb,
    name,
    network,
    releaseDate,
    time
  } = activity;

  // Calculate the number of days since the activity was posted
  const activityTime = new Date(time).getTime();
  const currentTime = new Date().getTime();
  const diffTime = currentTime - activityTime;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const randomNumber = Math.floor(Math.random() * 16);
  const imgUrl = `https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}`;

  return (
    <div className='flex items-start py-4'>
      <div className='flex-shrink-0'>
        <img className='h-10 w-10 rounded-full' src={imgUrl} alt='Avatar' />
      </div>
      <div className='ml-3'>
        <p className='dark:text-white-300 light:text-gray-900 text-sm font-medium'>
          <span className='nowrap'>
            {username} {verb} {name} ({network})
          </span>
        </p>
        <p className='text-sm text-gray-500'>
          Released on {releaseDate} | {diffDays} days ago
        </p>
      </div>
    </div>
  );
};
