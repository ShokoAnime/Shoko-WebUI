import { useToggle } from 'usehooks-ts';

import CalendarSchedule from '@/components/Calendar/CalendarSchedule';
import SeasonSchedule from '@/components/Calendar/Season/SeasonSchedule';
import AiringScheduleSettingsModal from '@/components/Calendar/Settings/AiringScheduleSettingsModal';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';

const AiringSchedule = () => {
  const { view } = useAiringScheduleParams();
  const [showSettings, toggleSettings] = useToggle(false);

  return (
    <>
      <title>Airing Schedule | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        {view === 'season'
          ? <SeasonSchedule onSettings={toggleSettings} />
          : <CalendarSchedule view={view} onSettings={toggleSettings} />}
      </div>

      <AiringScheduleSettingsModal show={showSettings} onClose={toggleSettings} />
    </>
  );
};

export default AiringSchedule;
