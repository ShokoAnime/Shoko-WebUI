import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import InputSmall from '../../../components/Input/InputSmall';
import Button from '../../../components/Input/Button';

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

  renderInput = (key: string, value: string | number, type: string) => (
    <div className="flex justify-between mt-1 first:mt-0" key={key}>
      {key}
      <InputSmall id={key} value={value} type={type} onChange={this.handleInputChange} className="w-32 px-2 py-0.5" />
    </div>
  );

  render() {
    const { isFetching } = this.props;
    const {
      Username, Password, ClientPort,
      AVDumpKey, AVDumpClientPort,
    } = this.state;

    return (
      <FixedPanel title="AniDB Login" options={this.renderOptions()} isFetching={isFetching}>
        {this.renderInput('Username', Username, 'text')}
        {this.renderInput('Password', Password, 'password')}
        {this.renderInput('ClientPort', ClientPort, 'number')}
        {this.renderInput('AVDumpKey', AVDumpKey, 'password')}
        {this.renderInput('AVDumpClientPort', AVDumpClientPort, 'number')}
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
