import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach, findKey, transform } from 'lodash';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';

type State = {
  fullStory: boolean;
  summary: boolean;
  parentStory: boolean;
  sideStory: boolean;
  prequel: boolean;
  sequel: boolean;
  altSetting: boolean;
  altVersion: boolean;
  sameSetting: boolean;
  character: boolean;
  other: boolean;
  dissimilarTitles: boolean;
  ova: boolean;
  movie: boolean;
};

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

class RelationSettings extends React.Component<Props, State> {
  state = {
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
  };

  componentDidMount = () => {
    const { AutoGroupSeriesRelationExclusions: exclusions } = this.props;
    const newState = transform(exclusions.split('|'), (result, item) => {
      const key = findKey(mapping, value => value === item);
      // eslint-disable-next-line no-param-reassign
      if (key) result[key] = true;
    }, {});
    this.setState(newState);
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id, checked: value } = event.target;
    saveSettings({ newSettings: { [id]: value } });
  };

  handleExclusionChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id, checked: value } = event.target;

    this.setState((prevState) => {
      const newState = Object.assign({}, prevState, { [id]: value });
      const exclusions: Array<string> = [];
      forEach(newState, (item, key) => {
        if (item) exclusions.push(mapping[key]);
      });
      saveSettings({ newSettings: { AutoGroupSeriesRelationExclusions: exclusions.join('|') } });
      return newState;
    });
  };

  render() {
    const {
      AutoGroupSeries, AutoGroupSeriesUseScoreAlgorithm,
      isFetching,
    } = this.props;
    const {
      fullStory, summary, parentStory, sideStory, prequel,
      sequel, altSetting, altVersion, sameSetting, character,
      other, dissimilarTitles, ova, movie,
    } = this.state;

    return (
      <FixedPanel title="Relation" isFetching={isFetching}>

        <div className="font-bold">Relation Options</div>
        <Checkbox label="Auto Group Series" id="AutoGroupSeries" isChecked={AutoGroupSeries} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Determine Main Series Using Relation Weighing" id="AutoGroupSeriesUseScoreAlgorithm" isChecked={AutoGroupSeriesUseScoreAlgorithm} onChange={this.handleInputChange} className="mt-1" />

        <div className="font-bold mt-3">Exclude following relations</div>
        <Checkbox label="Dissimilar Titles" id="dissimilarTitles" isChecked={dissimilarTitles} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Prequel" id="prequel" isChecked={prequel} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Sequel" id="sequel" isChecked={sequel} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="OVA" id="ova" isChecked={ova} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Movie" id="movie" isChecked={movie} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Same Setting" id="sameSetting" isChecked={sameSetting} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Alternative Setting" id="altSetting" isChecked={altSetting} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Alternative Version" id="altVersion" isChecked={altVersion} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Parent Story" id="parentStory" isChecked={parentStory} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Side Story" id="sideStory" isChecked={sideStory} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Full Story" id="fullStory" isChecked={fullStory} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Summary" id="summary" isChecked={summary} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Character" id="character" isChecked={character} onChange={this.handleExclusionChange} className="mt-1" />
        <Checkbox label="Other" id="other" isChecked={other} onChange={this.handleExclusionChange} className="mt-1" />

      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  AutoGroupSeries: state.localSettings.AutoGroupSeries,
  AutoGroupSeriesUseScoreAlgorithm: state.localSettings.AutoGroupSeriesUseScoreAlgorithm,
  AutoGroupSeriesRelationExclusions: state.localSettings.AutoGroupSeriesRelationExclusions,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(RelationSettings);
