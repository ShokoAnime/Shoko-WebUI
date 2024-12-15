import React from 'react';
import { useDispatch } from 'react-redux';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import useNavigateVoid from '@/hooks/useNavigateVoid';

function Acknowledgement() {
  const dispatch = useDispatch();

  const serverStatusQuery = useServerStatusQuery();

  const navigate = useNavigateVoid();

  const handleNext = () => {
    dispatch(setFirstRunSaved('acknowledgement'));
    navigate('../local-account');
  };

  return (
    <>
      <title>First Run &gt; Acknowledgement | Shoko</title>
      <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-6 text-justify">
        <div className="text-xl font-semibold">Acknowledgement</div>
        <div>
          It is important to clarify that Shoko is an anime cataloging program and not a standalone streaming service.
          Therefore, it requires access to physical files for playback. Additionally, Shoko does not offer any services
          for obtaining or downloading anime series.
        </div>
        <div>
          THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
          NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
          EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
          AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
          OR OTHER DEALINGS IN THE SOFTWARE.
        </div>
        <div className="font-semibold text-panel-text-important">
          We are constantly seeking talented individuals to join our team! If you believe you have the skills and
          expertise to contribute, we invite you to come and chat with us on&nbsp;
          <a
            href="https://discord.gg/vpeHDsg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-panel-text-primary hover:underline"
          >
            Discord
          </a>
          .
        </div>
        <Button
          onClick={handleNext}
          buttonType="primary"
          className="py-2 font-semibold"
          disabled={serverStatusQuery.data?.State !== 4}
        >
          Continue
        </Button>
      </TransitionDiv>
    </>
  );
}

export default Acknowledgement;
