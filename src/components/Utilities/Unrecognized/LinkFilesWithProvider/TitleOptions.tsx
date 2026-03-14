import React from 'react';
import { countBy } from 'lodash';

import { LinkState } from '@/core/types/utilities/unrecognized-utility';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

const TitleOptions = ({ links, selectedCount }: { links: ManualLinkType[], selectedCount: number }) => {
  const countByStatus = countBy(links, link => link.state) as Record<LinkState, number>;
  const submittedCount = countByStatus[LinkState.Submitted] ?? 0;
  const pendingCount = (countByStatus[LinkState.Submitting] ?? 0) + (countByStatus[LinkState.Ready] ?? 0);

  return (
    <div className="flex text-lg font-semibold">
      {(submittedCount + pendingCount) > 0 && (
        <>
          <div className="text-panel-text-important">
            {submittedCount}
          </div>
          &nbsp;/&nbsp;
          <div className="text-panel-text-important">
            {submittedCount + pendingCount}
          </div>
          &nbsp;Submitted&nbsp;|&nbsp;
        </>
      )}
      <div className="text-panel-text-important">
        {links.length}
      </div>
      &nbsp;
      {links.length === 1 ? 'File' : 'Files'}
      {selectedCount > 0 && (
        <>
          &nbsp;|&nbsp;
          <div className="text-panel-text-important">
            {selectedCount}
          </div>
          &nbsp;Selected
        </>
      )}
    </div>
  );
};

export default TitleOptions;
