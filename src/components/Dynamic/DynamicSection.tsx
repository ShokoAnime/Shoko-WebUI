import React from 'react';

import DynamicField from '@/components/Dynamic/DynamicField';

import type { FormSchemaType } from '@/core/types/api/configuration';

type Props = {
  configuration: Record<string, unknown>;
  setConfiguration: (config: Record<string, unknown>) => void;
  hideCodeBlocks?: boolean;
  hideHeader?: boolean;
  schema: FormSchemaType;
};

const DynamicSection = ({
  configuration,
  hideCodeBlocks,
  hideHeader,
  schema,
  setConfiguration,
}: Props) => {
  const { description, properties, title } = schema;
  const structure = schema['x-uiDefinition'].structure ?? {};

  const filteredKeys = Object.keys(structure).filter((key) => {
    const propertySchema = properties[key];
    if (!propertySchema) return false;
    return !(hideCodeBlocks && propertySchema['x-uiDefinition']?.elementType === 'code-block');
  });

  return (
    <div className="flex flex-col gap-y-6">
      {!hideHeader && (
        <>
          <div className="flex flex-col gap-y-1">
            {title && <div className="text-xl font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-65">{description}</div>}
          </div>
          <div className="border-b border-panel-border" />
        </>
      )}

      {filteredKeys.map((key) => {
        const propertySchema = properties[key];
        if (!propertySchema) return null;
        return (
          <div className="flex flex-col gap-y-1" key={key}>
            <DynamicField
              onChange={(value) => {
                setConfiguration({ ...configuration, [key]: value });
              }}
              propertyName={key}
              propertySchema={propertySchema}
              value={configuration[key]}
            />
            {propertySchema.description && <p className="text-sm opacity-65">{propertySchema.description}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicSection;
