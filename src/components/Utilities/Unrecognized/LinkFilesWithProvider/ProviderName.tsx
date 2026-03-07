import React from 'react';

import { LinkState } from '@/core/types/utilities/unrecognized-utility';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type Props = {
  link: ManualLinkType;
};

const linkStateAttributes = {
  [LinkState.PreInit]: {
    className: 'opacity-65',
    text: 'Initializing metadata...',
  },
  [LinkState.Init]: {
    className: 'text-panel-text-warning',
    text: 'Waiting for user action',
  },
  [LinkState.Searching]: {
    className: 'text-panel-text-primary',
    text: 'Searching for a match...',
  },
  [LinkState.Ready]: {
    className: 'text-panel-text-important',
    text: 'Ready for submission',
  },
  [LinkState.Submitting]: {
    className: 'text-panel-text-primary',
    text: 'Submitting match...',
  },
  [LinkState.Submitted]: {
    className: 'text-panel-text-important',
    text: 'Completed',
  },
} as const;

const ProviderName = ({ link }: Props) => {
  const name = link.release.ProviderName;
  const editedByUser = name.startsWith('User+') || name.endsWith('+User');
  const providerName = name !== 'User' && ![LinkState.Searching].includes(link.state)
    ? name
      .replace(/^User\+/, '')
      .replace(/\+User$/, '')
      .replaceAll('+', ' & ')
    : '';

  return (
    <div className="line-clamp-1">
      <span className={linkStateAttributes[link.state]?.className ?? 'text-panel-text-warning'}>
        {linkStateAttributes[link.state]?.text ?? ''}
      </span>
      {providerName && (
        <>
          &nbsp;-&nbsp;
          <span className="text-sm font-semibold">
            {providerName}
            {editedByUser && (
              <>
                &nbsp;
                <span className="opacity-65">(Edited by User)</span>
              </>
            )}
          </span>
        </>
      )}
    </div>
  );
};

export default ProviderName;
