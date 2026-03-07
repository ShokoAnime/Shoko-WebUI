import React, { useMemo } from 'react';

import type { ManualLink } from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesWithProvidersTab';

export type UnrecognizedVideoProviderNameProps = {
  link: ManualLink;
};

const UnrecognizedVideoProviderName = (props: UnrecognizedVideoProviderNameProps) => {
  const { link } = props;
  let linkState: ManualLink['state'] | 'can-submit' = link.state;
  if (link.state === 'pending' && link.release.CrossReferences.length > 0) {
    linkState = 'can-submit';
  }

  const state = useMemo(() => {
    switch (linkState) {
      case 'can-submit':
        return (
          <span className="text-panel-text-important">
            Ready for Submission
          </span>
        );
      case 'pre-init':
        return (
          <span className="opacity-65">
            In Initial Metadata Queue
          </span>
        );
      case 'initializing':
        return (
          <span className="opacity-65">
            Initializing Metadata
          </span>
        );
      case 'init':
      case 'pending':
        return (
          <span className="text-panel-text-warning">
            Waiting For User Action
          </span>
        );
      case 'search-queue':
        return (
          <span className="opacity-65">
            In Search Queue
          </span>
        );
      case 'searching':
        return (
          <span className="text-panel-text-primary">
            Searching for a Match
          </span>
        );
      case 'submit-queue':
        return (
          <span className="opacity-65">
            In Submit Queue
          </span>
        );
      case 'submitting':
        return (
          <span className="text-panel-text-primary">
            Submitting Match
          </span>
        );
      case 'submitted':
        return (
          <span className="text-panel-text-important">
            Completed
          </span>
        );
      default:
        return (
          <span className="text-panel-text-warning">
            {linkState}
          </span>
        );
    }
  }, [linkState]);

  const providerName = useMemo(() => {
    if (link.release.ProviderName === 'User' || linkState === 'search-queue' || linkState === 'searching') {
      return null;
    }
    if (/\+User\b|^User\+/.exec(link.release.ProviderName)) {
      return (
        <span className="text-sm font-semibold">
          {link.release.ProviderName.replace(/\+User\b|^User\+/, '').replace(/\+/g, ' & ')}
          <span className="opacity-65">(Edited by User)</span>
        </span>
      );
    }
    return (
      <span className="text-sm font-semibold">
        {link.release.ProviderName}
      </span>
    );
  }, [link.release.ProviderName, linkState]);

  return (
    <span className="line-clamp-1">
      {[
        state,
        providerName,
      ].filter(node => node != null).flatMap((node, index) => [
        index > 0 ? ' - ' : null,
        node,
      ])}
    </span>
  );
};

export default UnrecognizedVideoProviderName;
