import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type Props = {
  link: ManualLinkType;
};

const linkStateAttributes = {
  'pre-init': {
    className: 'opacity-65',
    text: 'Initializing metadata...',
  },
  init: {
    className: 'text-panel-text-warning',
    text: 'Waiting for user action',
  },
  searching: {
    className: 'text-panel-text-primary',
    text: 'Searching for a match...',
  },
  ready: {
    className: 'text-panel-text-important',
    text: 'Ready for submission',
  },
  submitting: {
    className: 'text-panel-text-primary',
    text: 'Submitting match...',
  },
  submitted: {
    className: 'text-panel-text-important',
    text: 'Completed',
  },
  fetching: {
    className: 'text-panel-text-primary',
    text: 'Retrieving existing release info...',
  },
} as const;

const ProviderName = ({ link }: Props) => {
  const name = link.release.ProviderName;
  const editedByUser = name.startsWith('User+') || name.endsWith('+User');
  const providerName = name !== 'User' && link.state !== 'searching'
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
