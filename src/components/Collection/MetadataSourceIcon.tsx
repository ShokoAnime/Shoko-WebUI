import { useState } from 'react';
import { mdiDatabaseOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  className?: string;
  /** Whether the server has an icon for the source, from `GET Metadata/Source`. */
  hasIcon?: boolean;
  /** The source, as the metadata routes take it. */
  source: string;
};

/** A source's icon from the server, or a generic database icon when it has none. */
const MetadataSourceIcon = ({ className, hasIcon = false, source }: Props) => {
  const [failed, setFailed] = useState(false);

  if (!hasIcon || failed) {
    return <Icon className={cx('shrink-0 text-panel-icon', className)} path={mdiDatabaseOutline} size={1} />;
  }

  return (
    <img
      alt=""
      className={cx('size-6 shrink-0 object-contain', className)}
      onError={() => setFailed(true)}
      src={`/api/v3/Metadata/Source/${encodeURIComponent(source)}/Icon`}
    />
  );
};

export default MetadataSourceIcon;
