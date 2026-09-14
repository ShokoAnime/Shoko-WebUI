import { useState } from 'react';
import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

import { formatStamp } from '@/core/react-query/logging/queries';
import LogLevelChip from '@/pages/logs/LogLevelChip';

import type { LogEventType } from '@/core/react-query/logging/types';

type Props = {
  dataIndex: number;
  event: LogEventType;
  measureRef: (node: HTMLDivElement | null) => void;
};

const LogRow = ({ dataIndex, event, measureRef }: Props) => {
  const [exceptionExpanded, setExceptionExpanded] = useState(false);

  // Logger and Caller are optional (older server versions may omit them)
  const sourceParts: string[] = [];
  if (event.Logger) sourceParts.push(event.Logger);
  if (event.Caller) sourceParts.push(event.Caller);
  const sourceText = sourceParts.join(' › ');

  return (
    <div className="flex items-start gap-x-4 py-1.5" data-index={dataIndex} ref={measureRef}>
      <div className="shrink-0 whitespace-nowrap text-panel-text opacity-65">
        {formatStamp(event.TimeStamp)}
      </div>
      <div className="w-24 shrink-0">
        <LogLevelChip level={event.Level} />
      </div>
      <div className="w-56 shrink-0" title={sourceText}>
        <span className="block truncate text-left opacity-65 [direction:rtl]">{sourceText}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-x-2">
          <div className="break-all">{event.Message}</div>
          {event.Exception && (
            <button
              type="button"
              className="mt-0.5 shrink-0 text-panel-text opacity-65 transition-colors hover:opacity-100"
              onClick={() => setExceptionExpanded(prev => !prev)}
              data-tooltip-id="tooltip"
              data-tooltip-content={`${exceptionExpanded ? 'Hide' : 'Show'} exception`}
              data-tooltip-place="top"
            >
              <Icon path={exceptionExpanded ? mdiChevronDown : mdiChevronRight} size={0.75} />
            </button>
          )}
        </div>
        {exceptionExpanded && event.Exception && (
          <pre className="mt-2 rounded-md border border-panel-border bg-panel-background p-3 text-xs/relaxed whitespace-pre-wrap opacity-80">
            {event.Exception}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LogRow;
