import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { activeTab as activeTabAction } from '../../core/actions/firstrun';
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
    const { nextTabKey, saveFunc, setActiveTab } = this.props;
    if (saveFunc) saveFunc();
    setActiveTab(nextTabKey);
  };

  render() {
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
            <Button onClick={() => this.handleBack()} className="bg-color-accent py-2 px-3 mr-4">Back</Button>
            <Button onClick={() => this.handleNext()} className="bg-color-accent py-2 px-3">Next</Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapDispatch = {
  setActiveTab: (value: string) => (activeTabAction(value)),
};

const connector = connect(() => ({}), mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  prevTabKey: string,
  nextTabKey: string,
  saveFunc?: () => void;
};

export default connector(Footer);
