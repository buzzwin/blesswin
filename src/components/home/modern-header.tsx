import cn from 'clsx';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import { Home, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type ModernHeaderProps = {
  tip?: string;
  title?: string;
  children?: ReactNode;
  className?: string;
  disableSticky?: boolean;
  useActionButton?: boolean;
  action?: () => void;
};

export function ModernHeader({
  tip,
  title,
  children,
  className,
  disableSticky,
  useActionButton,
  action
}: ModernHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        'sticky top-0 z-10',
        'bg-white/80 dark:bg-gray-900/80',
        'backdrop-blur-xl backdrop-saturate-150',
        'border-b border-gray-200 dark:border-gray-800',
        !disableSticky && 'sticky top-0',
        className
      )}
    >
      <Card className='border-0 bg-transparent shadow-none'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {useActionButton && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={action}
                  className='hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <Home className='h-5 w-5' />
                </Button>
              )}

              {title && (
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <Sparkles className='h-5 w-5 text-emerald-500' />
                    <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                      {title}
                    </h2>
                  </div>
                </div>
              )}
            </div>

            {children && (
              <div className='flex items-center gap-2'>{children}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
