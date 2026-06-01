import React from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import DynamicSection from '@/components/Dynamic/DynamicSection';
import { useConfigurationSchemaQuery } from '@/core/react-query/configuration/queries';

type Props = {
  configuration: Record<string, unknown>;
  configurationId: string;
  setConfiguration: (config: Record<string, unknown>) => void;
  hideCodeBlocks?: boolean;
  hideHeader?: boolean;
};

const DynamicForm = ({ configuration, configurationId, hideCodeBlocks, hideHeader, setConfiguration }: Props) => {
  const schemaQuery = useConfigurationSchemaQuery(configurationId);

  if (schemaQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center py-16 text-panel-text-primary">
        <Icon path={mdiLoading} spin size={5} />
      </div>
    );
  }

  if (schemaQuery.isError || !schemaQuery.data) {
    return (
      <div className="flex grow items-center justify-center py-16 text-panel-text-important">
        Failed to load configuration schema.
      </div>
    );
  }

  const schema = schemaQuery.data;
  const sectionType = schema['x-uiDefinition'].sectionType ?? 'field-set';

  if (sectionType === 'tab') {
    return (
      <div className="flex grow items-center justify-center py-16 text-panel-text-important">
        {/* TODO: DynamicTab */}
        Unsupported section type: tab
      </div>
    );
  }

  // field-set and minimal are handled the same way.
  return (
    <DynamicSection
      configuration={configuration}
      hideCodeBlocks={hideCodeBlocks}
      hideHeader={hideHeader}
      schema={schema}
      setConfiguration={setConfiguration}
    />
  );
};

export default DynamicForm;
