import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import AniDBSettingsControls from '@/components/Settings/AniDBSettings';
import { useAniDBTestLoginMutation } from '@/core/react-query/settings/mutations';
import toast from '@/core/toast';
import useSettingsContext from '@/hooks/useSettingsContext';

const AniDBSettings = () => {
  const { newSettings, updateSetting } = useSettingsContext();
  const { isPending: isAnidbLoginPending, mutate: testAniDbLogin } = useAniDBTestLoginMutation();

  const {
    AVDumpKey,
    HTTPServerUrl,
    Password,
    Username,
  } = newSettings.AniDb;

  const testLogin = () => {
    testAniDbLogin({ Username, Password }, {
      onSuccess: () => toast.success('AniDB Login Successful!'),
      onError: () => toast.error('Incorrect Username/Password!'),
    });
  };

  return (
    <>
      <title>Settings &gt; AniDB | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">AniDB</div>
        <div>
          Configure the information Shoko retrieves from AniDB for the series in your collection, and set your
          preferences for MyList options and the general updating of AniDB data.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="mt-0.5 flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="items-center font-semibold">Login Options</div>
          <Button
            onClick={() => testLogin()}
            loading={isAnidbLoginPending}
            buttonType="primary"
            buttonSize="small"
          >
            Test
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between">
            Username
            <InputSmall
              id="Username"
              value={Username}
              type="text"
              onChange={event => updateSetting('AniDb', event.target.id, event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            Password
            <InputSmall
              id="Password"
              value={Password}
              type="password"
              onChange={event => updateSetting('AniDb', event.target.id, event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            AVDump Key
            <InputSmall
              id="AVDumpKey"
              value={AVDumpKey ?? ''}
              type="password"
              onChange={event => updateSetting('AniDb', event.target.id, event.target.value)}
              className="w-36 px-3 py-1"
            />
          </div>
          <div className="flex justify-between">
            HTTP Server URL
            <InputSmall
              id="HTTPServerUrl"
              value={HTTPServerUrl}
              type="text"
              onChange={event => updateSetting('AniDb', event.target.id, event.target.value)}
              className="w-60 px-3 py-1"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <AniDBSettingsControls
        newSettings={newSettings}
        updateSetting={updateSetting}
      />
    </>
  );
};

export default AniDBSettings;
