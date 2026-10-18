import { useToggle } from 'usehooks-ts';

import AiringScheduleSettingsModal from '@/components/AiringSchedule/AiringScheduleSettingsModal';
import CalendarSchedule from '@/components/AiringSchedule/CalendarSchedule';
import SeasonSchedule from '@/components/AiringSchedule/SeasonSchedule';
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
