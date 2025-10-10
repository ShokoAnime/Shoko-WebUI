import React from 'react';

import CharacterImage from '@/components/CharacterImage';

import type { SeriesCast } from '@/core/types/api/series';
import type { CreditsModeType } from '@/pages/collection/series/SeriesCredits';

const getThumbnailUrl = (item: SeriesCast, mode: CreditsModeType) => {
  const thumbnail = item[mode]?.Image ?? null;
  if (!thumbnail?.RelativeFilepath) return null;
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const CreditsStaffPanel = React.memo(({ cast, mode }: { cast: SeriesCast, mode: CreditsModeType }) => (
  <div className="flex w-full h-full flex-row items-center gap-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold">
    <div className="z-10 flex gap-x-2">
      {mode === 'Character' && (
        <CharacterImage
          imageSrc={getThumbnailUrl(cast, 'Character')}
          className="relative h-[7.75rem] w-[6.063rem] rounded-lg"
        />
      )}
      <CharacterImage
        imageSrc={getThumbnailUrl(cast, 'Staff')}
        className="relative h-[7.75rem] w-[6.063rem] rounded-lg"
      />
    </div>
    <div className="grow text-center">
      <div className="line-clamp-2 text-base leading-8 xl:text-xl" title={cast[mode]?.Name}>
        {cast[mode]?.Name}
      </div>
      {mode === 'Character' && <div className="opacity-65">{cast.Staff?.Name}</div>}
      <div className="mt-2 text-sm">{cast.RoleDetails}</div>
    </div>
  </div>
));

export default CreditsStaffPanel;
