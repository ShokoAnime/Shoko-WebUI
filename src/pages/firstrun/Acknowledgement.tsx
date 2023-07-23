import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { useGetInitStatusQuery } from '@/core/rtkQuery/splitV3Api/initApi';

function Acknowledgement() {
  const dispatch = useDispatch();

  const status = useGetInitStatusQuery();

  const navigate = useNavigate();

  const handleNext = () => {
    dispatch(setFirstRunSaved('acknowledgement'));
    navigate('../local-account');
  };

  return (
    <TransitionDiv className="flex flex-col text-justify justify-center max-w-[38rem] gap-y-8">
      <div className="font-semibold text-xl">Acknowledgement</div>
      <div>
        It is important to clarify that Shoko is an anime cataloging program and not a standalone streaming service.
        Therefore, it requires access to physical files for playback.
        Additionally, Shoko does not offer any services for obtaining or downloading anime series.
      </div>
      <div>
        THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
        LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
        SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
        OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
        DEALINGS IN THE SOFTWARE.
      </div>
      <div className="font-semibold text-panel-important">
        We are constantly seeking talented individuals to join our team! If you believe you have the skills and
        expertise to contribute, we invite you to come and chat with us on&nbsp;
        <a href="https://discord.gg/vpeHDsg" target="_blank" rel="noopener noreferrer" className="text-panel-primary hover:underline">Discord</a>.
      </div>
      <Button onClick={handleNext} className="bg-button-primary hover:bg-button-primary-hover font-semibold py-2" disabled={status.data?.State !== 4}>Continue</Button>
    </TransitionDiv>
  );
}

export default Acknowledgement;
