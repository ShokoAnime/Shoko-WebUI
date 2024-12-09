/* eslint-disable @typescript-eslint/naming-convention */
import React, { useMemo, useState } from 'react';
import { mdiLoading, mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { keys, remove } from 'lodash';

import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import { useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';
import useSettingsContext from '@/hooks/useSettingsContext';

import type { DropResult } from '@hello-pangea/dnd';

const getLanguageOrderName = (type: 'Series' | 'Episode' | 'Description') => {
  switch (type) {
    case 'Episode':
      return 'EpisodeTitleLanguageOrder';
    case 'Description':
      return 'DescriptionLanguageOrder';
    default:
      return 'SeriesTitleLanguageOrder';
  }
};

const CollectionSettings = () => {
  const { newSettings, setNewSettings } = useSettingsContext();
  const [showLanguagesModal, setShowLanguagesModal] = useState<'Series' | 'Episode' | 'Description' | null>(null);

  const {
    AutoGroupSeries,
    AutoGroupSeriesRelationExclusions,
    AutoGroupSeriesUseScoreAlgorithm,
    Language,
  } = newSettings;

  const languagesQuery = useSupportedLanguagesQuery();
  const languageDescription = useMemo(() => languagesQuery.data ?? {}, [languagesQuery.data]);

  const onDragEnd = (result: DropResult, type: 'Series' | 'Episode' | 'Description') => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const items = Array.from(Language[getLanguageOrderName(type)]);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    setNewSettings({
      ...newSettings,
      Language: {
        ...Language,
        [getLanguageOrderName(type)]: items,
      },
    });
  };

  const removeLanguage = (language: string, type: 'Series' | 'Episode' | 'Description') => {
    const items = Array.from(Language[getLanguageOrderName(type)]);
    remove(items, item => item === language);
    setNewSettings({
      ...newSettings,
      Language: {
        ...Language,
        [getLanguageOrderName(type)]: items,
      },
    });
  };

  const exclusionMapping = {
    dissimilarTitles: {
      id: 'AllowDissimilarTitleExclusion',
      name: 'Dissimilar Titles',
    },
    prequel: {
      id: 'prequel',
      name: 'Prequel',
    },
    sequel: {
      id: 'sequel',
      name: 'Sequel',
    },
    ova: {
      id: 'ova',
      name: 'OVA',
    },
    movie: {
      id: 'movie',
      name: 'Movie',
    },
    sameSetting: {
      id: 'same setting',
      name: 'Same Setting',
    },
    altSetting: {
      id: 'alternative setting',
      name: 'Alternative Setting',
    },
    altVersion: {
      id: 'alternative version',
      name: 'Alternative Version',
    },
    parentStory: {
      id: 'parent story',
      name: 'Parent Story',
    },
    sideStory: {
      id: 'side story',
      name: 'Side Story',
    },
    fullStory: {
      id: 'full story',
      name: 'Full Story',
    },
    summary: {
      id: 'summary',
      name: 'Summary',
    },
    character: {
      id: 'character',
      name: 'Character',
    },
    other: {
      id: 'other',
      name: 'Other',
    },
  };

  function isExclusionKey(id: string): id is keyof typeof exclusionMapping {
    return id in exclusionMapping;
  }

  const handleExclusionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!(event.target.id in exclusionMapping)) return;
    const { checked, id } = event.target;

    if (isExclusionKey(id)) {
      if (checked) {
        const tempExclusions = [...AutoGroupSeriesRelationExclusions, exclusionMapping[id].id];
        setNewSettings({ ...newSettings, AutoGroupSeriesRelationExclusions: tempExclusions });
      } else {
        const tempExclusions = AutoGroupSeriesRelationExclusions.filter(
          exclusion => exclusion !== exclusionMapping[id].id,
        );
        setNewSettings({ ...newSettings, AutoGroupSeriesRelationExclusions: tempExclusions });
      }
    }
  };

  return (
    <>
      <title>Settings &gt; Collection | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Collection</div>
        <div>
          Set your preferred language for the series and episodes in your collection, and determine how Shoko groups
          related series within your collection.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {/* Language Settings */}
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Language Options</div>
        {languagesQuery.isPending
          && <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />}
        {Object.keys(languageDescription).length > 0 && (
          <>
            <div className="flex flex-col gap-y-1">
              <Checkbox
                label="Also Use Synonyms"
                id="LanguageUseSynonyms"
                isChecked={Language.UseSynonyms}
                onChange={event =>
                  setNewSettings({
                    ...newSettings,
                    Language: { ...Language, UseSynonyms: event.target.checked },
                  })}
                justify
              />
              <div className="mt-2 flex justify-between">
                Series Title (Drag to Reorder)
                <Button onClick={() => setShowLanguagesModal('Series')} tooltip="Add Language">
                  <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
                </Button>
              </div>
              <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
                {Language.SeriesTitleLanguageOrder.length > 0
                  ? (
                    <DnDList onDragEnd={result => onDragEnd(result, 'Series')}>
                      {Language.SeriesTitleLanguageOrder.map(language => (
                        {
                          key: language,
                          item: (
                            <div className="mt-2.5 flex items-center justify-between group-first:mt-0">
                              {languageDescription[language]}
                              <Button onClick={() => removeLanguage(language, 'Series')} tooltip="Remove">
                                <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                              </Button>
                            </div>
                          ),
                        }
                      ))}
                    </DnDList>
                  )
                  : <div>Title preference not set. Fallback to main title.</div>}
              </div>
              <div className="mt-2 flex justify-between">
                Episode Title (Drag to Reorder)
                <Button onClick={() => setShowLanguagesModal('Episode')} tooltip="Add Language">
                  <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
                </Button>
              </div>
              <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
                <DnDList onDragEnd={result => onDragEnd(result, 'Episode')}>
                  {Language.EpisodeTitleLanguageOrder.map(language => (
                    {
                      key: language,
                      item: (
                        <div className="mt-2 flex items-center justify-between group-first:mt-0">
                          {languageDescription[language]}
                          <Button onClick={() => removeLanguage(language, 'Episode')} tooltip="Remove">
                            <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                          </Button>
                        </div>
                      ),
                    }
                  ))}
                </DnDList>
              </div>
              <div className="mt-2 flex justify-between">
                Descriptions (Drag to Reorder)
                <Button onClick={() => setShowLanguagesModal('Description')} tooltip="Add Language">
                  <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
                </Button>
              </div>
              <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
                <DnDList onDragEnd={result => onDragEnd(result, 'Description')}>
                  {Language.DescriptionLanguageOrder.map(language => (
                    {
                      key: language,
                      item: (
                        <div className="mt-2 flex items-center justify-between group-first:mt-0">
                          {languageDescription[language]}
                          <Button onClick={() => removeLanguage(language, 'Description')} tooltip="Remove">
                            <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                          </Button>
                        </div>
                      ),
                    }
                  ))}
                </DnDList>
              </div>
            </div>
            <LanguagesModal type={showLanguagesModal} onClose={() => setShowLanguagesModal(null)} />
          </>
        )}
      </div>

      <div className="border-b border-panel-border" />

      {/*   Relation Settings */}
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Relation Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Auto Group Series"
            id="auto-group-series"
            isChecked={AutoGroupSeries}
            onChange={event => setNewSettings({ ...newSettings, AutoGroupSeries: event.target.checked })}
          />
          <Checkbox
            justify
            label="Determine Main Series Using Relation Weighing"
            id="auto-group-using-score"
            isChecked={AutoGroupSeriesUseScoreAlgorithm}
            onChange={event =>
              setNewSettings({ ...newSettings, AutoGroupSeriesUseScoreAlgorithm: event.target.checked })}
          />
          Exclude following relations
          <div className="mt-2 flex flex-col gap-y-1.5 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
            {keys(exclusionMapping).map((item: keyof typeof exclusionMapping) => (
              <Checkbox
                justify
                label={exclusionMapping[item].name}
                id={item}
                isChecked={AutoGroupSeriesRelationExclusions.includes(exclusionMapping[item].id)}
                onChange={handleExclusionChange}
                key={item}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
};

export default CollectionSettings;
