import { mdiLoading, mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import { addNoLanguageOption } from '@/core/react-query/settings/helpers';
import { useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';

import type { DropResult } from '@hello-pangea/dnd';

type Props = {
  label: string;
  order: string[];
  onOrderChange: (languages: string[]) => void;
  onAddLanguage: () => void;
  noLanguageOption?: boolean;
  emptyStateMessage?: string;
};

const LanguageOrderList = ({
  emptyStateMessage,
  label,
  noLanguageOption,
  onAddLanguage,
  onOrderChange,
  order,
}: Props) => {
  const languagesQuery = useSupportedLanguagesQuery();

  const languageDescription = noLanguageOption
    ? addNoLanguageOption(languagesQuery.data ?? {})
    : (languagesQuery.data ?? {});

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const items = [...order];
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    onOrderChange(items);
  };

  const removeLanguage = (language: string) => {
    onOrderChange(order.filter(item => item !== language));
  };

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          {label}
          {order.length > 0 && <span className="text-xs opacity-65">(Drag to Reorder)</span>}
        </div>
        <Button disabled={!languagesQuery.isSuccess} onClick={onAddLanguage} tooltip="Add Language">
          <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
        </Button>
      </div>
      <div className="flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {languagesQuery.isPending
          && <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />}

        {languagesQuery.isError
          && <div className="text-sm text-panel-text-danger">Failed to load supported languages.</div>}

        {languagesQuery.isSuccess && order.length > 0
          && (
            <DnDList onDragEnd={onDragEnd}>
              {order.map(language => (
                {
                  key: language,
                  item: (
                    <div className="flex items-center justify-between py-1">
                      {languageDescription[language] ?? language}
                      <Button onClick={() => removeLanguage(language)} tooltip="Remove">
                        <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    </div>
                  ),
                }
              ))}
            </DnDList>
          )}
        {languagesQuery.isSuccess && order.length === 0
          && emptyStateMessage
          && <div className="text-sm opacity-65">{emptyStateMessage}</div>}
      </div>
    </div>
  );
};

export default LanguageOrderList;
