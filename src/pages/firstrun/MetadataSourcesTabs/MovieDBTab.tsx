import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/UseFirstRunSettingsContext';

function TMDBTab() {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  const { TMDB } = newSettings;

  return (
    <TransitionDiv className="flex flex-col gap-y-6">
      <div className="border-b-2 border-panel-border pb-4 font-semibold">Download Options</div>
      <div className="flex flex-col gap-y-2">
        <Checkbox
          justify
          label="Auto Link"
          id="autolink-tmdb"
          isChecked={TMDB.AutoLink}
          onChange={event => updateSetting('TMDB', 'AutoLink', event.target.checked)}
        />
        <Checkbox
          justify
          label="Auto Link Restricted"
          id="auto-link-restricted-tmdb"
          isChecked={TMDB.AutoLinkRestricted}
          onChange={event => updateSetting('TMDB', 'AutoLinkRestricted', event.target.checked)}
        />
        <Checkbox
          justify
          label="Download Crew And Cast"
          id="crew-and-cast-tmdb"
          isChecked={TMDB.AutoDownloadCrewAndCast}
          onChange={event => updateSetting('TMDB', 'AutoDownloadCrewAndCast', event.target.checked)}
        />
        <Checkbox
          justify
          label="Download Movie Collections"
          id="movie-collections-tmdb"
          isChecked={TMDB.AutoDownloadCollections}
          onChange={event => updateSetting('TMDB', 'AutoDownloadCollections', event.target.checked)}
        />
        <Checkbox
          justify
          label="Download Alternate Ordering"
          id="alternate-ordering-tmdb"
          isChecked={TMDB.AutoDownloadAlternateOrdering}
          onChange={event => updateSetting('TMDB', 'AutoDownloadAlternateOrdering', event.target.checked)}
        />
        <Checkbox
          justify
          label="Download Backdrops"
          id="download-backdrops-tmdb"
          isChecked={TMDB.AutoDownloadBackdrops}
          onChange={event => updateSetting('TMDB', 'AutoDownloadBackdrops', event.target.checked)}
        />
        <div
          className={cx(
            'flex justify-between transition-opacity items-center',
            !TMDB.AutoDownloadBackdrops && 'pointer-events-none opacity-65',
          )}
        >
          Max Backdrops
          <InputSmall
            id="max-backdrops-tmdb"
            value={TMDB.MaxAutoPosters}
            type="text"
            onChange={event => updateSetting('TMDB', 'MaxAutoPosters', event.target.value)}
            className="w-12 px-3 py-1"
          />
        </div>
        <Checkbox
          justify
          label="Download Posters"
          id="download-posters-tmdb"
          isChecked={TMDB.AutoDownloadPosters}
          onChange={event => updateSetting('TMDB', 'AutoDownloadPosters', event.target.checked)}
        />
        <div
          className={cx(
            'flex justify-between transition-opacity items-center',
            !TMDB.AutoDownloadPosters && 'pointer-events-none opacity-65',
          )}
        >
          Max Posters
          <InputSmall
            id="max-posters-tmdb"
            value={TMDB.MaxAutoPosters}
            type="text"
            onChange={event => updateSetting('TMDB', 'MaxAutoPosters', event.target.value)}
            className="w-12 px-3 py-1"
          />
        </div>
        <Checkbox
          justify
          label="Download Logos"
          id="download-logos-tmdb"
          isChecked={TMDB.AutoDownloadLogos}
          onChange={event => updateSetting('TMDB', 'AutoDownloadLogos', event.target.checked)}
        />
        <div
          className={cx(
            'flex justify-between transition-opacity items-center',
            !TMDB.AutoDownloadLogos && 'pointer-events-none opacity-65',
          )}
        >
          Max Logos
          <InputSmall
            id="max-logos-tmdb"
            value={TMDB.MaxAutoLogos}
            type="text"
            onChange={event => updateSetting('TMDB', 'MaxAutoLogos', event.target.value)}
            className="w-12 px-3 py-1"
          />
        </div>
        <Checkbox
          justify
          label="Download Episode Thumbnails"
          id="download-thumbnails-tmdb"
          isChecked={TMDB.AutoDownloadThumbnails}
          onChange={event => updateSetting('TMDB', 'AutoDownloadThumbnails', event.target.checked)}
        />
        <div
          className={cx(
            'flex justify-between transition-opacity items-center',
            !TMDB.AutoDownloadThumbnails && 'pointer-events-none opacity-65',
          )}
        >
          Max Episode Thumbnails
          <InputSmall
            id="max-thumbnails-tmdb"
            value={TMDB.MaxAutoThumbnails}
            type="text"
            onChange={event => updateSetting('TMDB', 'MaxAutoThumbnails', event.target.value)}
            className="w-12 px-3 py-1"
          />
        </div>
        <Checkbox
          justify
          label="Download Staff Images"
          id="download-staff-tmdb"
          isChecked={TMDB.AutoDownloadStaffImages}
          onChange={event => updateSetting('TMDB', 'AutoDownloadStaffImages', event.target.checked)}
        />
        <div
          className={cx(
            'flex justify-between transition-opacity items-center',
            !TMDB.AutoDownloadStaffImages && 'pointer-events-none opacity-65',
          )}
        >
          Max Staff Images
          <InputSmall
            id="max-staff-tmdb"
            value={TMDB.MaxAutoStaffImages}
            type="text"
            onChange={event => updateSetting('TMDB', 'MaxAutoStaffImages', event.target.value)}
            className="w-12 px-3 py-1"
          />
        </div>
        <Checkbox
          justify
          label="Download Studio Images"
          id="download-studio-tmdb"
          isChecked={TMDB.AutoDownloadStudioImages}
          onChange={event => updateSetting('TMDB', 'AutoDownloadStudioImages', event.target.checked)}
        />
      </div>
    </TransitionDiv>
  );
}

export default TMDBTab;
