import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { keys } from 'lodash';

import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import TextSourcesModal from '@/components/Dialogs/TextSourcesModal';
import Checkbox from '@/components/Input/Checkbox';
import LanguageOrderList from '@/components/Settings/LanguageOrderList';
import OrderList from '@/components/Settings/OrderList';
import TextSourceLabel from '@/components/Settings/TextSourceLabel';
import { getTextSourceOrder, getTextSources } from '@/core/react-query/metadata/helpers';
import { useMetadataLinkSourcesQuery, useMetadataProvidersQuery } from '@/core/react-query/metadata/queries';
import useSettingsContext from '@/hooks/useSettingsContext';

type TextSourceOrderKeyType = 'DescriptionSourceOrder' | 'EpisodeTitleSourceOrder' | 'SeriesTitleSourceOrder';

const textSourceOrderNames: Record<TextSourceOrderKeyType, string> = {
  SeriesTitleSourceOrder: 'Series Title',
  EpisodeTitleSourceOrder: 'Episode Title',
  DescriptionSourceOrder: 'Description',
};

const CollectionSettings = () => {
  const { newSettings, setNewSettings } = useSettingsContext();
  const [showLanguagesModal, setShowLanguagesModal] = useState<'Series' | 'Episode' | 'Description' | null>(null);
  const [showSourcesModal, setShowSourcesModal] = useState<TextSourceOrderKeyType | null>(null);

  // `Metadata/Source` names the sources and has their icons; the providers name the plugins serving them.
  const linkSourcesQuery = useMetadataLinkSourcesQuery();
  const providersQuery = useMetadataProvidersQuery();
  const textSources = getTextSources(linkSourcesQuery.data, providersQuery.data);

  const {
    AutoGroupSeries,
    AutoGroupSeriesRelationExclusions,
    AutoGroupSeriesUseScoreAlgorithm,
    Language,
  } = newSettings;

  const handleLanguageOrderChange = (
    key: 'DescriptionLanguageOrder' | 'EpisodeTitleLanguageOrder' | 'SeriesTitleLanguageOrder',
    languages: string[],
  ) => {
    setNewSettings({ ...newSettings, Language: { ...Language, [key]: languages } });
  };

  const handleSourceOrderChange = (key: TextSourceOrderKeyType, sources: string[]) => {
    setNewSettings({ ...newSettings, Language: { ...Language, [key]: sources } });
  };

  // Each source keeps the spelling the settings have it in, so a name no route lists is saved back as it was.
  const renderSourceOrder = (key: TextSourceOrderKeyType) => (
    <OrderList
      label={`${textSourceOrderNames[key]} Source`}
      items={getTextSourceOrder(Language[key], textSources).map((source, index) => ({
        key: Language[key][index],
        content: <TextSourceLabel source={source} />,
      }))}
      onOrderChange={sources => handleSourceOrderChange(key, sources)}
      onAdd={() => setShowSourcesModal(key)}
      addTooltip="Add Source"
      isPending={linkSourcesQuery.isPending}
      errorMessage={linkSourcesQuery.isError ? 'Failed to load metadata sources.' : undefined}
      emptyStateMessage="No source set."
    />
  );

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

  const isExclusionKey = (id: string): id is keyof typeof exclusionMapping => id in exclusionMapping;

  const handleExclusionChange = (event: ChangeEvent<HTMLInputElement>) => {
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
          Set your preferred languages and sources for the titles and descriptions in your collection, and determine how
          Shoko groups related series within your collection.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {/* Language Settings */}
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Language Options</div>
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
          <div className="flex flex-col gap-y-3">
            <LanguageOrderList
              label="Series Title Language"
              order={Language.SeriesTitleLanguageOrder}
              onAddLanguage={() => setShowLanguagesModal('Series')}
              onOrderChange={languages => handleLanguageOrderChange('SeriesTitleLanguageOrder', languages)}
            />
            {renderSourceOrder('SeriesTitleSourceOrder')}
            <LanguageOrderList
              label="Episode Title Language"
              order={Language.EpisodeTitleLanguageOrder}
              onAddLanguage={() => setShowLanguagesModal('Episode')}
              onOrderChange={languages => handleLanguageOrderChange('EpisodeTitleLanguageOrder', languages)}
            />
            {renderSourceOrder('EpisodeTitleSourceOrder')}
            <LanguageOrderList
              label="Description Language"
              order={Language.DescriptionLanguageOrder}
              onAddLanguage={() => setShowLanguagesModal('Description')}
              onOrderChange={languages => handleLanguageOrderChange('DescriptionLanguageOrder', languages)}
            />
            {renderSourceOrder('DescriptionSourceOrder')}
            <div className="text-sm opacity-65">
              Titles and descriptions users add or pick always apply, whatever the source order.
            </div>
          </div>
        </div>
        <LanguagesModal type={showLanguagesModal} onClose={() => setShowLanguagesModal(null)} />
        <TextSourcesModal
          type={showSourcesModal && textSourceOrderNames[showSourcesModal]}
          order={showSourcesModal ? Language[showSourcesModal] : []}
          sources={textSources}
          onOrderChange={sources => showSourcesModal && handleSourceOrderChange(showSourcesModal, sources)}
          onClose={() => setShowSourcesModal(null)}
        />
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
