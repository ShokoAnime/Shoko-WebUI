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
    <TransitionDiv className="flex flex-col text-justify justify-center px-96">
      <div className="font-semibold">Thanks For Installing Shoko Server!</div>
      <div className="mt-9">
        We want to stress that Shoko is an anime cataloging program and not a stand-alone
        streaming service and requires access to physical files for playback. Shoko also does
        not provide any services on how to obtain or download anime series.
      </div>
      <div className="mt-9">
        THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
        HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
        CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
        THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      </div>
      <div className="font-semibold mt-9 text-highlight-2">
        We&apos;re always looking for more individuals to join our team! If you think you can
        help, come talk with us on
        <span className="text-primary cursor-pointer" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}> Discord</span>
      </div>
      <div className="flex justify-center mt-9">
        <Button onClick={() => handleNext()} className="bg-primary font-semibold w-96 py-2" disabled={status.State !== 4}>Continue</Button>
      </div>
    </TransitionDiv>
  );
}

export default Acknowledgement;
