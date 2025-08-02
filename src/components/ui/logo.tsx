import * as React from 'react';
import Image from 'next/image';

const LogoIcon = (props: any) => (
  <Image
    src='/logo.PNG'
    alt='Buzzwin Logo'
    width={425}
    height={425}
    className={props.className || ''}
    priority
  />
);

export default LogoIcon;
