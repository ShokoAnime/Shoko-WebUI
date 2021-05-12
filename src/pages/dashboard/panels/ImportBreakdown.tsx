import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import ImportedTab from './ImportBreakdownTabs/ImportedTab';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

type State = {
  activeTab: string,
};

class ImportBreakdown extends React.Component<Props, State> {
  state = {
    activeTab: 'imported',
  };

  handleTabChange = (tab: string) => {
    this.setState({ activeTab: tab });
  };

  renderOptions = () => {
    const { activeTab } = this.state;
    return (
      <div className="font-mulish font-bold">
        <Button onClick={() => this.handleTabChange('imported')} className={cx(['mr-2 font-mulish font-bold', activeTab === 'imported' && 'color-accent'])}>
          Imported
        </Button>
        <Button onClick={() => this.handleTabChange('unrecognized')} className={cx(['mr-2 font-mulish font-bold', activeTab === 'unrecognized' && 'color-accent'])}>
          Unrecognized
        </Button>
      </div>
    );
  };

  renderContent = () => {
    const { activeTab } = this.state;

    switch (activeTab) {
      case 'imported':
        return <ImportedTab />;
      case 'unrecognized':
        return <UnrecognizedTab />;
      default:
        return <ImportedTab />;
    }
  };

  render() {
    const { activeTab } = this.state;
    const { hasFetchedRecents, hasFetchedUnrecognized } = this.props;

    const hasFetched = activeTab === 'unrecognized' ? hasFetchedUnrecognized : hasFetchedRecents;

    return (
      <FixedPanel title="Import Breakdown" options={this.renderOptions()} isFetching={!hasFetched}>
        {this.renderContent()}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  hasFetchedRecents: state.mainpage.fetched.recentFiles,
  hasFetchedUnrecognized: state.mainpage.fetched.unrecognizedFiles,
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportBreakdown);
