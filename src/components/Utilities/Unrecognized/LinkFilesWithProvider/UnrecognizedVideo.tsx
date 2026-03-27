import React from 'react';
import cx from 'classnames';

import { LinkState } from '@/core/types/utilities/unrecognized-utility';

import CrossReference from './CrossReference';
import ProviderName from './ProviderName';
import VideoMetadata from './VideoMetadata';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type Props = {
  link: ManualLinkType;
  toggleSelect: (event: React.KeyboardEvent | React.MouseEvent) => void;
  selected: boolean;
};

const linkStateClassMap = {
  [LinkState.PreInit]: 'opacity-65 cursor-wait',
  [LinkState.Init]: '',
  [LinkState.Searching]: 'animate-pulse cursor-wait',
  [LinkState.Ready]: 'cursor-pointer',
  [LinkState.Submitting]: 'cursor-progress',
  [LinkState.Submitted]: '',
} as const;

const selectionDisabledStates = [
  LinkState.PreInit,
  LinkState.Searching,
  LinkState.Submitting,
];

const UnrecognizedVideo = (props: Props) => {
  const { link, selected, toggleSelect } = props;

  let border = 'border-panel-border';
  if (link.state === LinkState.Submitted) {
    border = 'border-panel-text-important';
  } else if ([LinkState.Searching, LinkState.Submitting].includes(link.state)) {
    border = 'border-panel-text-primary';
  } else if (link.state === LinkState.Ready) {
    border = 'border-panel-text-warning';
  } else if (selected) {
    border = 'border-panel-text-primary';
  }

  const handleSelect = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (selectionDisabledStates.includes(link.state)) return;
    toggleSelect(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'Space') {
      event.preventDefault();
      handleSelect(event);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    // Prevent native text selection on shift+click to avoid flash of selection
    // and allow clean shift-range selection behavior
    if (event.shiftKey) event.preventDefault();
  };

  return (
    <div
      className={cx(
        'flex w-full cursor-pointer flex-col gap-y-2 rounded-lg border bg-panel-background p-4 leading-5 transition-colors focus:border-panel-text! focus:outline-none',
        border,
        selected && 'bg-panel-background-selected-row!',
        !selected && linkStateClassMap[link.state],
        [LinkState.Ready, LinkState.Submitting, LinkState.Submitted].includes(link.state) && 'bg-panel-background-alt',
      )}
      onMouseDown={handleMouseDown}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <div className="flex flex-col gap-2">
        <ProviderName link={link} />

        <VideoMetadata link={link} />

        <div className="flex flex-col gap-y-1">
          {link.release.CrossReferences.length
            ? (
              <>
                {link.release.CrossReferences.map(xref => (
                  <CrossReference
                    key={`${xref.AnidbEpisodeID}-${xref.AnidbAnimeID}-${xref.PercentageStart}-${xref.PercentageEnd}`}
                    xref={xref}
                  />
                ))}
              </>
            )
            : (
              <div className="text-sm font-semibold">
                Not Yet Linked
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UnrecognizedVideo;
