import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon
} from 'next-share';
import type { ViewingActivity } from '@components/activity/types';

interface ShareButtonsProps {
  viewingActivity: ViewingActivity;
  text: string;
  id: string;
  shareURL: string;
  close?: () => void;
}

const ShareButtons = ({
  viewingActivity,
  text,
  shareURL
}: ShareButtonsProps) => {
  return (
    <>
      {viewingActivity && (
        <div className='flex justify-center space-x-4 bg-white p-8 shadow-lg'>
          <div className='flex flex-col items-center'>
            <FacebookShareButton url={shareURL} quote={text}>
              <FacebookIcon className='h-10 w-10' />
            </FacebookShareButton>
          </div>
          <div className='flex flex-col items-center'>
            <WhatsappShareButton url={shareURL} title={text}>
              <WhatsappIcon className='h-10 w-10' />
            </WhatsappShareButton>
          </div>

          {/* <div className='flex flex-col items-center'>
            <button
              onClick={close}
              className='flex flex-col items-center justify-center w-10 h-10 rounded-full bg-accent-blue/10 hover:bg-accent-blue/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/80'
            >
              Close
            </button>
          </div> */}
          {/* <PinterestShareButton
          url={shareURL}
          media={image}
          description={description}
        >
          <PinterestIcon className='w-5 h-5' />
          <span className='ml-2'>Pin on Pinterest</span>
        </PinterestShareButton>
        <RedditShareButton url={shareURL} title={title}>
          <RedditIcon className='w-5 h-5' />
          <span className='ml-2'>Share on Reddit</span>
        </RedditShareButton> */}
        </div>
      )}
    </>
  );
};

export default ShareButtons;
