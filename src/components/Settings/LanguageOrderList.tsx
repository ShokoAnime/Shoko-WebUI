import OrderList from '@/components/Settings/OrderList';
import { addNoLanguageOption } from '@/core/react-query/settings/helpers';
import { useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';

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

  return (
    <OrderList
      label={label}
      items={order.map(language => ({ key: language, content: languageDescription[language] ?? language }))}
      onOrderChange={onOrderChange}
      onAdd={onAddLanguage}
      addTooltip="Add Language"
      isPending={languagesQuery.isPending}
      errorMessage={languagesQuery.isError ? 'Failed to load supported languages.' : undefined}
      emptyStateMessage={emptyStateMessage}
    />
  );
};

export default LanguageOrderList;
