/* eslint-disable import/namespace */

import { forwardRef } from 'react';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as OutlineIcons from '@heroicons/react/24/outline';

export type IconName = keyof typeof SolidIcons | keyof typeof OutlineIcons;

type HeroIconProps = {
  solid?: boolean;
  iconName: IconName;
  className?: string;
};

export const HeroIcon = forwardRef<SVGSVGElement, HeroIconProps>(
  ({ solid, iconName, className }, ref) => {
    const Icon = solid ? SolidIcons[iconName] : OutlineIcons[iconName];

    if (!Icon) {
      console.error(`Icon ${iconName} not found`);
      return null;
    }

    return (
      <Icon ref={ref} className={className ?? 'h-6 w-6'} aria-hidden='true' />
    );
  }
);

HeroIcon.displayName = 'HeroIcon';
