import React from 'react';
import { Icon } from '@mdi/react';

type ExternalLinkMenuItemProps = {
  url: string;
  name: string;
  icon: string;
};

const ExternalLinkMenuItem = React.memo(({
  icon,
  name,
  url,
}: ExternalLinkMenuItemProps) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer noopener"
    aria-label={`Open ${name}`}
    data-tooltip-id="tooltip"
    data-tooltip-content={name}
  >
    <Icon className="text-topnav-icon" path={icon} size={1} />
  </a>
));

export default ExternalLinkMenuItem;
