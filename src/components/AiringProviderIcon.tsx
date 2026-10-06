import { useState } from 'react';
import { mdiDatabaseOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { getAiringProviderIconUrl } from '@/core/react-query/airing-schedule/helpers';

type Props = {
  className?: string;
  /** Whether the server has an icon for the provider, from the provider's `HasIcon`. */
  hasIcon: boolean;
  /**
   * The provider's name, for the tooltip and the accessible label where the icon stands in for the name. Left out
   * where the name is shown next to the icon.
   */
  label?: string;
  providerId: string;
  /** In `@mdi/react` units: 1 is 1.5rem. */
  size?: number;
};

/** An airing provider's icon from the server, or the generic icon the metadata sources use when it has none. */
const AiringProviderIcon = ({ className, hasIcon, label, providerId, size = 1 }: Props) => {
  const [failed, setFailed] = useState(false);
  const labelProps = label
    ? { 'aria-label': label, 'data-tooltip-id': 'tooltip', 'data-tooltip-content': label, role: 'img' }
    : { 'aria-hidden': true };

  if (!hasIcon || failed) {
    return (
      <span className={cx('flex shrink-0', className)} {...labelProps}>
        <Icon className="text-panel-icon" path={mdiDatabaseOutline} size={size} />
      </span>
    );
  }

  return (
    <img
      alt={label ?? ''}
      className={cx('shrink-0 object-contain', className)}
      data-tooltip-id={label ? 'tooltip' : undefined}
      data-tooltip-content={label}
      onError={() => setFailed(true)}
      src={getAiringProviderIconUrl(providerId)}
      style={{ width: `${size * 1.5}rem`, height: `${size * 1.5}rem` }}
    />
  );
};

export default AiringProviderIcon;
