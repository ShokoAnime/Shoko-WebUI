import { useState } from 'react';

import PluginManagementSections from '@/components/Settings/PluginManagement/PluginManagementSections';
import PluginRestartPanel from '@/components/Settings/PluginManagement/PluginRestartPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import { useDispatch } from '@/core/store';

import Footer from './Footer';

import type { PluginManagementSectionType } from '@/components/Settings/PluginManagement/PluginManagementSections.utils';

const Plugins = () => {
  const dispatch = useDispatch();
  const [section, setSection] = useState<PluginManagementSectionType>('installed');

  return (
    <>
      <title>First Run &gt; Plugins | Shoko</title>
      <TransitionDiv className="flex size-full max-w-230 flex-col gap-y-6">
        <div className="text-xl font-semibold">Plugins</div>
        <div className="text-justify">
          Plugins add metadata sources, release providers and other features to Shoko. This step is optional: you can
          install plugins now, before the server is started for the first time, or later from the settings.
        </div>
        <PluginRestartPanel returnTo="/webui/firstrun/plugins">
          Plugins installed, updated, enabled or disabled here only take effect once the server is restarted. Your setup
          so far is kept.
        </PluginRestartPanel>
        <div className="flex min-h-0 grow flex-col gap-y-6 overflow-y-auto pr-4">
          <PluginManagementSections section={section} onSectionChange={setSection} />
        </div>
        <Footer
          nextPage="start-server"
          saveFunction={() => dispatch(setFirstRunSaved('plugins'))}
        />
      </TransitionDiv>
    </>
  );
};

export default Plugins;
