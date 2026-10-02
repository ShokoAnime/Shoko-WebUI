import { useState } from 'react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import LanguageOrderList from '@/components/Settings/LanguageOrderList';

import type { SettingsMetadataImageType } from '@/core/types/api/settings';

type Props = {
  /** Keeps the inputs' IDs apart when several sources show their own. */
  id: string;
  settings: SettingsMetadataImageType;
  onChange: (settings: SettingsMetadataImageType) => void;
};

type ImageTypeOptionType = {
  label: string;
  enabled: keyof SettingsMetadataImageType;
  max?: keyof SettingsMetadataImageType;
  maxLabel?: string;
};

const imageTypes: ImageTypeOptionType[] = [
  { label: 'Download Backdrops', enabled: 'AutoDownloadBackdrops', max: 'MaxAutoBackdrops', maxLabel: 'Max Backdrops' },
  { label: 'Download Posters', enabled: 'AutoDownloadPosters', max: 'MaxAutoPosters', maxLabel: 'Max Posters' },
  { label: 'Download Logos', enabled: 'AutoDownloadLogos', max: 'MaxAutoLogos', maxLabel: 'Max Logos' },
  { label: 'Download Banners', enabled: 'AutoDownloadBanners', max: 'MaxAutoBanners', maxLabel: 'Max Banners' },
  {
    label: 'Download Episode Thumbnails',
    enabled: 'AutoDownloadThumbnails',
    max: 'MaxAutoThumbnails',
    maxLabel: 'Max Episode Thumbnails',
  },
  {
    label: 'Download Staff Images',
    enabled: 'AutoDownloadStaffImages',
    max: 'MaxAutoStaffImages',
    maxLabel: 'Max Staff Images',
  },
  { label: 'Download Studio Images', enabled: 'AutoDownloadStudioImages' },
];

/** Which images to download for a metadata source, or for every source without settings of its own. */
const MetadataImageSettings = ({ id, onChange, settings }: Props) => {
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);

  const update = (key: keyof SettingsMetadataImageType, value: boolean | number | string[]) =>
    onChange({ ...settings, [key]: value });

  return (
    <>
      {imageTypes.map(({ enabled, label, max, maxLabel }) => (
        <div key={enabled} className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label={label}
            id={`${id}-${enabled}`}
            isChecked={settings[enabled] as boolean}
            onChange={event => update(enabled, event.target.checked)}
          />
          {max && (
            <div
              className={cx(
                'flex items-center justify-between transition-opacity',
                !settings[enabled] && 'pointer-events-none opacity-65',
              )}
            >
              {maxLabel}
              <InputSmall
                id={`${id}-${max}`}
                value={settings[max] as number}
                type="number"
                min={0}
                max={30}
                onChange={event => update(max, toNumber(event.target.value))}
                className="w-12 px-3 py-1"
              />
            </div>
          )}
        </div>
      ))}
      <LanguageOrderList
        label="Image Languages"
        order={settings.ImageLanguageOrder}
        onAddLanguage={() => setShowLanguagesModal(true)}
        onOrderChange={languages => update('ImageLanguageOrder', languages)}
        noLanguageOption
        emptyStateMessage="No image language preference set. Images in all languages will be downloaded."
      />
      <LanguagesModal
        type={showLanguagesModal ? 'Image' : null}
        imageOrder={settings.ImageLanguageOrder}
        onImageOrderChange={languages => update('ImageLanguageOrder', languages)}
        onClose={() => setShowLanguagesModal(false)}
      />
    </>
  );
};

export default MetadataImageSettings;
