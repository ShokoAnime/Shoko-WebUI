import type { KeyboardEvent, MouseEvent } from 'react';
import cx from 'classnames';

import CrossReference from './CrossReference';
import ProviderName from './ProviderName';
import VideoMetadata from './VideoMetadata';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type Props = {
  link: ManualLinkType;
  toggleSelect: (event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => void;
  selected: boolean;
};

const linkStateClassMap = {
  'pre-init': 'opacity-65 cursor-wait',
  init: '',
  searching: 'animate-pulse cursor-wait',
  ready: 'cursor-pointer',
  submitting: 'cursor-progress',
  submitted: '',
  linked: 'animate-pulse cursor-wait',
} as const;

const selectionDisabledStates = [
  'pre-init',
  'searching',
  'submitting',
  'linked',
];

const UnrecognizedVideo = (props: Props) => {
  const { link, selected, toggleSelect } = props;

  let border = 'border-panel-border';
  if (link.state === 'submitted') {
    border = 'border-panel-text-important';
  } else if (['searching', 'submitting'].includes(link.state)) {
    border = 'border-panel-text-primary';
  } else if (link.state === 'ready') {
    border = 'border-panel-text-warning';
  } else if (selected) {
    border = 'border-panel-text-primary';
  }

  const handleSelect = (event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
    if (selectionDisabledStates.includes(link.state)) return;
    toggleSelect(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'Space') {
      event.preventDefault();
      handleSelect(event);
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    // Prevent native text selection on shift+click to avoid flash of selection
    // and allow clean shift-range selection behavior
    if (event.shiftKey) event.preventDefault();
  };

  return (
    <div
      className={cx(
        'flex w-full cursor-pointer flex-col gap-y-2 rounded-lg border bg-panel-background p-4 leading-5 transition-colors focus:outline-none focus-visible:border-panel-text!',
        border,
        selected && 'bg-panel-background-selected-row!',
        !selected && linkStateClassMap[link.state],
        ['ready', 'submitting', 'submitted'].includes(link.state) && 'bg-panel-background-alt',
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
