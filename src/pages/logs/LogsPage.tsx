import { useState } from 'react';
import { mdiArrowVerticalLock, mdiFilterRemoveOutline, mdiMagnify } from '@mdi/js';
import cx from 'classnames';
import { useImmer } from 'use-immer';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import IconButton from '@/components/Input/IconButton';
import Input from '@/components/Input/Input';
import { useLogsQuery } from '@/core/react-query/logging/queries';
import { formatThousand } from '@/core/util';
import LogLevelChip from '@/pages/logs/LogLevelChip';
import LogLiveView from '@/pages/logs/LogLiveView';
import LogSearchView from '@/pages/logs/LogSearchView';

import type { LogLevelType } from '@/core/react-query/logging/types';

// `None` is MEL enum completeness only — the server never emits it, so it's not
// offered as a filter here.
const logLevels: LogLevelType[] = ['Trace', 'Debug', 'Information', 'Warning', 'Error', 'Critical'];

const LogsPage = () => {
  const logLines = useLogsQuery().data;
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search.trim(), 250);
  const [activeLevels, setActiveLevels] = useImmer<Set<LogLevelType>>(new Set());

  // Live mode shows the SignalR tail; any debounced search text switches to server-side search
  const searchMode = debouncedSearch !== '';
  const filtersActive = search !== '' || activeLevels.size > 0;

  const toggleLevel = (level: LogLevelType) => {
    setActiveLevels((draft) => {
      if (draft.has(level)) {
        draft.delete(level);
      } else {
        draft.add(level);
      }
    });
  };

  const clearFilters = () => {
    setSearch('');
    setActiveLevels(new Set());
  };

  return (
    <>
      <title>Logs | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-panel-border bg-panel-background p-6">
          <div className="flex flex-col">
            <div className="text-xl font-semibold">
              Logs
            </div>
            <div className="text-sm opacity-65">
              {searchMode
                ? 'Searching the full log history on the server'
                : `${formatThousand(logLines.length)} lines in the live tail`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {logLevels.map(level => (
                <Button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  tooltip={`${activeLevels.has(level) ? 'Hide' : 'Show'} ${level} logs`}
                >
                  <LogLevelChip level={level} active={activeLevels.has(level)} />
                </Button>
              ))}
            </div>

            <Input
              id="search"
              type="text"
              placeholder="Search..."
              startIcon={mdiMagnify}
              value={search}
              onChange={event => setSearch(event.target.value)}
              inputClassName="py-2!"
            />
            <IconButton
              icon={mdiFilterRemoveOutline}
              buttonType="secondary"
              buttonSize="normal"
              disabled={!filtersActive}
              onClick={clearFilters}
              tooltip="Clear filters"
            />
            <IconButton
              icon={mdiArrowVerticalLock}
              buttonType="secondary"
              buttonSize="normal"
              disabled={searchMode}
              className={cx(scrollToBottom ? 'text-panel-icon-action' : 'text-panel-text!')}
              onClick={() => setScrollToBottom(prev => !prev)}
              tooltip={`${scrollToBottom ? 'Disable' : 'Enable'} scroll to bottom`}
            />
          </div>
        </div>

        <div className="flex grow rounded-lg border border-panel-border bg-panel-background p-6">
          {searchMode
            ? (
              <LogSearchView
                search={debouncedSearch}
                activeLevels={activeLevels}
                onClearFilters={clearFilters}
              />
            )
            : (
              <LogLiveView
                logLines={logLines}
                activeLevels={activeLevels}
                scrollToBottom={scrollToBottom}
                setScrollToBottom={setScrollToBottom}
                onClearFilters={clearFilters}
              />
            )}
        </div>
      </div>
    </>
  );
};

export default LogsPage;
