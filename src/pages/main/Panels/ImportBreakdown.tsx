import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import ImportedTab from './ImportBreakdownTabs/ImportedTab';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

import { RecentFileType } from '../../../core/types/api';

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
      <div className="font-muli font-bold">
        <Button onClick={() => this.handleTabChange('imported')} className={cx(['mr-2 font-muli font-bold', activeTab === 'imported' && 'color-accent'])}>
          Imported
        </Button>
        <Button onClick={() => this.handleTabChange('unrecognized')} className={cx(['mr-2 font-muli font-bold', activeTab === 'unrecognized' && 'color-accent'])}>
          Unrecognized
        </Button>
      </div>
    );
  };

  renderContent = () => {
    const { activeTab } = this.state;
    const { items } = this.props;

    const importedItems: Array<RecentFileType> = [];
    const unrecognizedItems: Array<RecentFileType> = [];

    forEach(items, item => (
      item.recognized ? importedItems.push(item) : unrecognizedItems.push(item)
    ));

    switch (activeTab) {
      case 'imported':
        return <ImportedTab items={importedItems} />;
      case 'unrecognized':
        return <UnrecognizedTab items={unrecognizedItems} />;
      default:
        return <ImportedTab items={importedItems} />;
    }
  };

  render() {
    const { hasFetched } = this.props;

    return (
      <FixedPanel title="Import Breakdown" options={this.renderOptions()}>
        {!hasFetched ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
          </div>
        ) : this.renderContent()}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  items: state.mainpage.recentFiles as Array<RecentFileType>,
  hasFetched: state.mainpage.fetched.recentFiles,
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportBreakdown);
