import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';

import { RootState } from '../../core/store';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Button from '../../components/Input/Button';
import TransitionDiv from '../../components/TransitionDiv';

function Acknowledgement() {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.firstrun.serverStatus);

  const handleNext = () => {
    dispatch(setFirstRunSaved('acknowledgement'));
    dispatch((push('db-setup')));
  };

  return (
    <TransitionDiv className="flex flex-col flex-grow text-justify justify-center">
      <div className="font-bold text-lg">Thanks For Installing Shoko Server!</div>
      <div className="font-mulish mt-6">
        We want to stress that Shoko is an anime cataloging program and not a stand-alone
        streaming service and requires access to physical files for playback. Shoko also does
        not provide any services on how to obtain or download anime series.
      </div>
      <div className="font-mulish mt-10">
        THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
        HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
        CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
        THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      </div>
      <div className="font-mulish font-bold text-lg mt-10">
        We&apos;re always looking for more individuals to join our team! If you think you can
        help, come talk with us on
        <span className="color-highlight-1 cursor-pointer" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}> Discord</span>.
      </div>
      <div className="flex justify-center mt-20">
        <Button onClick={() => handleNext()} className="bg-color-highlight-1 font-semibold py-5 px-24" disabled={status.State !== 4}>Continue</Button>
      </div>
    </TransitionDiv>
  );
}

export default Acknowledgement;
