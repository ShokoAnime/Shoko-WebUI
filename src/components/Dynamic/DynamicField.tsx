import React, { Suspense, lazy } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import InputSmall from '@/components/Input/InputSmall';

import type { PropertySchemaType } from '@/core/types/api/configuration';

const CodeEditor = lazy(() => import('@/components/Dynamic/CodeEditor'));

type Props = {
  onChange: (value: unknown) => void;
  propertyName: string;
  propertySchema: PropertySchemaType;
  value: unknown;
};

const DynamicField = ({ onChange, propertyName, propertySchema, value }: Props) => {
  const { 'x-uiDefinition': uiDef } = propertySchema;
  const label = propertySchema.title ?? propertyName;

  if (!uiDef) return null;

  const { elementType } = uiDef;

  if (elementType === 'auto') {
    const jsonType = propertySchema.type;

    if (jsonType === 'boolean') {
      return (
        <Checkbox
          id={`dynamic-${propertyName}`}
          isChecked={!!value}
          label={label}
          onChange={event => onChange(event.target.checked)}
          justify
        />
      );
    }

    if (jsonType === 'integer' || jsonType === 'number') {
      return (
        <div className="flex items-center justify-between">
          {label}
          <InputSmall
            id={`dynamic-${propertyName}`}
            max={propertySchema.maximum}
            min={propertySchema.minimum}
            onChange={event => onChange(event.target.valueAsNumber)}
            type="number"
            value={(value as number) ?? 0}
            className="w-16 px-3 py-1 text-center"
          />
        </div>
      );
    }

    // string (or fallback)
    return (
      <Input
        id={`dynamic-${propertyName}`}
        label={label}
        onChange={event => onChange(event.target.value)}
        type="text"
        value={(value as string) ?? ''}
      />
    );
  }

  if (elementType === 'code-block') {
    const language = (uiDef.codeLanguage ?? 'plaintext').toLowerCase();
    return (
      <div className="flex flex-col gap-y-1">
        <span className="text-base font-semibold">{label}</span>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Icon path={mdiLoading} spin size={3} />
            </div>
          }
        >
          <CodeEditor
            language={language}
            onChange={onChange}
            value={(value as string) ?? ''}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-1 rounded-lg border border-panel-border bg-panel-background p-4">
      <span className="text-base font-semibold text-panel-text-important">{label}</span>
      <span className="text-sm">{`Unsupported element type: ${elementType}`}</span>
    </div>
  );
};

export default DynamicField;

// TODO: Unsupported element types (with real schema examples):
// - enum      → Select dropdown from enumDefinitions
//                e.g. OfflineImporter.Mode, OfflineImporter.MatchType,
//                CoreSettings.AniDb.MyList_StorageState, CoreSettings.AniDb.Calendar_UpdateFrequency
// - list      → DynamicList (add/remove/sort items)
//                e.g. OfflineImporter.AutoMatchRules, OfflineImporter.ParseRules,
//                CoreSettings.Import.VideoExtensions, CoreSettings.Image.ImageTemplateUrls
// - password  → Password input (masked text)
//                e.g. CoreSettings.AniDb.Password
// - record    → DynamicRecord (add/remove/sort key-value entries, IDictionary on backend)
//                (no live examples found yet)
// - select    → Select dropdown with server-provided options (SelectComponent)
//                e.g. OfflineImporter.AutoMatchRule.LocationRules[].ManagedFolderSelector
// - text-area → TextArea (multiline text)
//                e.g. OfflineImporter.CustomParseRule.Regex
//
// TODO: Missing features for already-supported element types:
// - elementSize  → 'small' should use InputSmall for number/string; 'large'/'full' should widen the input.
//                  Currently all strings use <Input> and all numbers use <InputSmall> regardless of size.
// - visibility   → 'hidden' / 'read-only' defaults, toggle (conditional show/hide), disableToggle (conditional disable).
//                  Currently all fields always render unconditionally.
//                  e.g. OfflineImporter.SkipAvailabilityCheck (advanced:true, badge:"Debug")
//                  e.g. CoreSettings.AniDb.AnidbID (toggle: show when RuleType=anidb)
// - badge        → Render badge pill (name + theme) next to the label.
//                  e.g. CoreSettings.Import.MaxAutoScanAttemptsPerFile (name:"Advanced", theme:"primary")
//                  e.g. CoreSettings.Import.FileLockChecking (name:"Debug", theme:"warning")
// - description  → propertySchema.description is available but not rendered (tooltip or subtitle).
// - requiresRestart → No restart indicator rendered when uiDef.requiresRestart is true.
// - envVar       → No indicator when the value is overridable via environment variable.
// - codeAutoFormatOnLoad → code-block's autoFormatOnLoad flag is ignored.
// - deniedValues → enum:deniedValues not checked (values excluded from UI selection).
