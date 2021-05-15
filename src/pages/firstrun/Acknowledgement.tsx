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
        <div className="flex flex-col flex-grow p-10 text-justify">
          <div className="font-bold text-lg">Thanks For Installing Shoko Server!</div>
          <div className="font-mulish mt-5">
            We want to stress that Shoko is an anime cataloging program and not a stand-alone
            streaming service and requires access to physical files for playback. Shoko also does
            not provide any services on how to obtain or download anime series.
          </div>
          <div className="font-mulish mt-4">
            THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
            HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
            CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
            THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </div>
          <div className="font-mulish font-bold mt-8">
            We&apos;re always looking for more individuals to join our team! If you think you can
            help, come talk with us on Discord.
          </div>
          <div className="flex h-full justify-center items-center mt-6">
            <Button onClick={() => this.handleNext()} className="bg-color-highlight-1 font-semibold py-2 px-5 rounded" disabled={status.State !== 4}>Continue</Button>
          </div>
        </div>
        <div className="help flex px-10 py-2 rounded-br-lg justify-between">
          <div className="color-highlight-1 font-mulish font-bold text-xs flex items-center">
            Need Help Setting Shoko Server Up?
          </div>
          <div className="flex">
            <Button className="color-highlight-1 mr-5" onClick={() => this.handleHelpButton('discord')}>
              <FontAwesomeIcon icon={faDiscord} className="text-xl" />
            </Button>
            <Button className="color-highlight-1" onClick={() => this.handleHelpButton('docs')}>
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
