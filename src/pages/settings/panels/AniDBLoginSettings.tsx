import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Buttons/Button';

type State = {
  Username: string;
  Password: string;
  ClientPort: number;
  AVDumpKey: string;
  AVDumpClientPort: number;
};

class AniDBLoginSettings extends React.Component<Props, State> {
  state = {
    Username: '',
    Password: '',
    ClientPort: 4556,
    AVDumpKey: '',
    AVDumpClientPort: 4557,
  };

  componentDidMount = () => {
    const {
      Username, Password, ClientPort,
      AVDumpKey, AVDumpClientPort,
    } = this.props;
    this.setState({
      Username,
      Password,
      ClientPort,
      AVDumpKey,
      AVDumpClientPort,
    });
  };

  handleInputChange = (event: any) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
  };

  testAndSave = () => {
    const { testAnidb } = this.props;
    testAnidb(this.state);
  };

  renderOptions = () => {
    const { isTesting } = this.props;
    return (
      <div className="flex">
        <Button onClick={() => this.testAndSave()} tooltip="Test and Save" className="color-highlight-1">
          <FontAwesomeIcon icon={isTesting ? faSpinner : faSave} spin={isTesting} />
        </Button>
      </div>
    );
  };

  render() {
    const { isFetching } = this.props;
    const {
      Username, Password, ClientPort,
      AVDumpKey, AVDumpClientPort,
    } = this.state;

    return (
      <FixedPanel title="AniDB Login" options={this.renderOptions()} isFetching={isFetching}>
        <div className="flex justify-between mb-1">
          Username
          <Input id="Username" value={Username} type="text" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          Password
          <Input id="Password" value={Password} type="password" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          Port
          <Input id="ClientPort" value={ClientPort} type="number" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          AvDump Key
          <Input id="AVDumpKey" value={AVDumpKey} type="password" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          AvDump Port
          <Input id="AVDumpClientPort" value={AVDumpClientPort} type="number" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.AniDb),
  isTesting: state.fetching.aniDBTest,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  testAnidb: (payload: State) => ({ type: Events.SETTINGS_ANIDB_TEST, payload }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBLoginSettings);
