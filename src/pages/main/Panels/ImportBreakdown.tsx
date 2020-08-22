import React from 'react';
import cx from 'classnames';

import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import ImportedTab from './ImportBreakdownTabs/ImportedTab';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

type State = {
  activeTab: string,
};

class ImportBreakdown extends React.Component<{}, State> {
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
    return (
      <FixedPanel title="Import Breakdown" options={this.renderOptions()}>
        {this.renderContent()}
      </FixedPanel>
    );
  }
}

export default ImportBreakdown;
