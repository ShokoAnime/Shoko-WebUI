import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { replace } from 'connected-react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import { setActiveTab as setFirstRunTab } from '../../core/slices/firstrun';
import Button from '../../components/Buttons/Button';

class Footer extends React.Component<Props> {
  handleHelpButton = (value: string) => {
    if (value === 'discord') window.open('https://discord.gg/vpeHDsg', '_blank');
    else if (value === 'docs') window.open('https://docs.shokoanime.com', '_blank');
  };

  handleBack = () => {
    const { prevTabKey, setActiveTab } = this.props;
    setActiveTab(prevTabKey);
  };

  handleNext = () => {
    const { nextTabKey, saveFunction: saveFunc, setActiveTab } = this.props;
    if (saveFunc) saveFunc();
    if (nextTabKey) setActiveTab(nextTabKey);
  };

  render() {
    const {
      prevDisabled, nextDisabled, finish, finishSetup,
      isFetching,
    } = this.props;

    return (
      <React.Fragment>
        <div className="help flex px-10 py-4 rounded-br-lg justify-between">
          <div className="flex">
            <Button className="color-accent mr-6" onClick={() => this.handleHelpButton('discord')}>
              <FontAwesomeIcon icon={faDiscord} className="text-3xl" />
            </Button>
            <Button className="color-accent" onClick={() => this.handleHelpButton('docs')}>
              <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl" />
            </Button>
          </div>
          <div className="flex">
            <Button onClick={() => this.handleBack()} className="bg-color-accent py-2 px-3 mr-4" disabled={prevDisabled}>Back</Button>
            {finish ? (
              <Button onClick={() => finishSetup()} className="bg-color-accent py-2 px-3" disabled={nextDisabled}>Finish</Button>
            ) : (
              <Button onClick={() => this.handleNext()} className="bg-color-accent py-2 px-3 flex items-center" disabled={nextDisabled || isFetching}>
                {isFetching ? (<FontAwesomeIcon icon={faSpinner} spin className="mx-2" />) : 'Next'}
              </Button>
            )}
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
  finishSetup: () => (replace({ pathname: '/main' })),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  prevTabKey: string,
  nextTabKey?: string,
  prevDisabled?: boolean,
  nextDisabled?: boolean,
  isFetching?: boolean,
  finish?: boolean,
  saveFunction?: () => void;
};

export default connector(Footer);
