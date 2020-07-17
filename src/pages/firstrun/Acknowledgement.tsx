import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import { setActiveTab as setFirstRunTab, setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Button from '../../components/Buttons/Button';

class Acknowledgement extends React.Component<Props> {
  handleHelpButton = (value: string) => {
    if (value === 'discord') window.open('https://discord.gg/vpeHDsg', '_blank');
    else if (value === 'docs') window.open('https://docs.shokoanime.com', '_blank');
  };

  handleNext = () => {
    const { setActiveTab, setSaved } = this.props;
    setSaved('acknowledgement');
    setActiveTab('db-setup');
  };

  render() {
    const { status } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Thanks For Installing Shoko Server!</div>
          <div className="font-muli mt-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </div>
          <div className="flex h-full justify-center items-center">
            <Button onClick={() => this.handleNext()} className="bg-color-accent  py-2 px-5 rounded" disabled={status.State !== 4}>Continue Setup</Button>
          </div>
        </div>
        <div className="help flex px-10 py-2 rounded-br-lg justify-between">
          <div className="color-accent font-muli font-bold text-xs flex items-center">
            Need Help Setting Shoko Server Up?
          </div>
          <div className="flex">
            <Button className="color-accent mr-5" onClick={() => this.handleHelpButton('discord')}>
              <FontAwesomeIcon icon={faDiscord} className="text-xl" />
            </Button>
            <Button className="color-accent" onClick={() => this.handleHelpButton('docs')}>
              <FontAwesomeIcon icon={faQuestionCircle} className="text-xl" />
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  status: state.firstrun.status,
});

const mapDispatch = {
  setActiveTab: (value: string) => (setFirstRunTab(value)),
  setSaved: (value: string) => (setFirstRunSaved(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(Acknowledgement);
