import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach, findKey, transform } from 'lodash';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';

const mapping = {
  fullStory: 'full story',
  summary: 'summary',
  parentStory: 'parent story',
  sideStory: 'side story',
  prequel: 'prequel',
  sequel: 'sequel',
  altSetting: 'alternative setting',
  altVersion: 'alternative version',
  sameSetting: 'same setting',
  character: 'character',
  other: 'other',
  dissimilarTitles: 'AllowDissimilarTitleExclusion',
  ova: 'ova',
  movie: 'movie',
};

function RelationSettings() {
  const dispatch = useDispatch();

  const isFetchingSettings = useSelector((state: RootState) => state.fetching.settings);
  const AutoGroupSeries = useSelector((state: RootState) => state.localSettings.AutoGroupSeries);
  const AutoGroupSeriesRelationExclusions = useSelector(
    (state: RootState) => state.localSettings.AutoGroupSeriesRelationExclusions,
  );
  const AutoGroupSeriesUseScoreAlgorithm = useSelector(
    (state: RootState) => state.localSettings.AutoGroupSeriesUseScoreAlgorithm,
  );

  const [exclusions, setExclusions] = useState({
    fullStory: false,
    summary: false,
    parentStory: false,
    sideStory: false,
    prequel: false,
    sequel: false,
    altSetting: false,
    altVersion: false,
    sameSetting: false,
    character: false,
    other: false,
    dissimilarTitles: false,
    ova: false,
    movie: false,
  });

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { newSettings } },
  );

  useEffect(() => {
    const newExclusions = transform(AutoGroupSeriesRelationExclusions.split('|'), (result, item) => {
      const key = findKey(mapping, value => value === item);
      // eslint-disable-next-line no-param-reassign
      if (key) result[key] = true;
    }, exclusions);
    setExclusions(newExclusions);
  }, [AutoGroupSeriesRelationExclusions]);

  const handleInputChange = (event: any) => {
    const { id, checked: value } = event.target;
    saveSettings({ [id]: value });
  };

  const handleExclusionChange = (event: any) => {
    const { id, checked: value } = event.target;

    const tempExclusions = Object.assign({}, exclusions, { [id]: value });
    const newExclusions: Array<string> = [];
    forEach(tempExclusions, (item, key) => {
      if (item) newExclusions.push(mapping[key]);
    });

    saveSettings({ AutoGroupSeriesRelationExclusions: newExclusions.join('|') });

    setExclusions(tempExclusions);
  };

  const {
    fullStory, summary, parentStory, sideStory, prequel,
    sequel, altSetting, altVersion, sameSetting, character,
    other, dissimilarTitles, ova, movie,
  } = exclusions;

  return (
    <FixedPanel title="Relation" isFetching={isFetchingSettings}>

      <div className="font-bold">Relation Options</div>
      <Checkbox label="Auto Group Series" id="AutoGroupSeries" isChecked={AutoGroupSeries} onChange={handleInputChange} className="mt-1" />
      <Checkbox label="Determine Main Series Using Relation Weighing" id="AutoGroupSeriesUseScoreAlgorithm" isChecked={AutoGroupSeriesUseScoreAlgorithm} onChange={handleInputChange} className="mt-1" />

      <div className="font-bold mt-3">Exclude following relations</div>
      <Checkbox label="Dissimilar Titles" id="dissimilarTitles" isChecked={dissimilarTitles} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Prequel" id="prequel" isChecked={prequel} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Sequel" id="sequel" isChecked={sequel} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="OVA" id="ova" isChecked={ova} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Movie" id="movie" isChecked={movie} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Same Setting" id="sameSetting" isChecked={sameSetting} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Alternative Setting" id="altSetting" isChecked={altSetting} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Alternative Version" id="altVersion" isChecked={altVersion} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Parent Story" id="parentStory" isChecked={parentStory} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Side Story" id="sideStory" isChecked={sideStory} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Full Story" id="fullStory" isChecked={fullStory} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Summary" id="summary" isChecked={summary} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Character" id="character" isChecked={character} onChange={handleExclusionChange} className="mt-1" />
      <Checkbox label="Other" id="other" isChecked={other} onChange={handleExclusionChange} className="mt-1" />

    </FixedPanel>
  );
}
export default RelationSettings;
