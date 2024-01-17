import React, { useEffect, useState } from 'react';
import { mdiClipboardTextOutline } from '@mdi/js';
import { uniqueId } from 'lodash';
import { useCopyToClipboard } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useCreateApiToken, useDeleteApiToken } from '@/core/react-query/auth/mutations';
import { useApiKeyQuery } from '@/core/react-query/auth/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { AuthToken } from '@/core/types/api/authToken';

const UserApiTokens = (prop: { userInfo: AuthToken, onDeleteToken?: () => void }) => {
  const { onDeleteToken, userInfo: { Device, Username } } = prop;
  const { mutate: deleteToken } = useDeleteApiToken();
  const onDeleteClick = useEventCallback(() => {
    deleteToken(Device);
    onDeleteToken?.();
  });

  return (
    <div className="flex flex-row justify-between">
      <div className="flex w-[65%] flex-col gap-y-1">
        <span className="font-light">{Username}</span>
        <span className="font-normal">{Device}</span>
      </div>
      <Button buttonType="danger" className="px-4 py-2" onClick={onDeleteClick}>
        Delete API Key
      </Button>
    </div>
  );
};

const ApiKeys = () => {
  const [keyValue, setKeyValue] = useState('');
  const [isRefetch, setIsRefetch] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [inputDisabled, setInputDisabled] = useState(false);
  const [, copy] = useCopyToClipboard();
  const onKeyChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyValue(event.target.value);
  });

  const {
    data: createdToken,
    isError: generatedFailed,
    isSuccess: generatedSucceed,
    mutate: createApiToken,
  } = useCreateApiToken();

  const handleCopyToClipboard = useEventCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    copy(keyValue);
  });

  const onGenerateClick = useEventCallback(() => {
    createApiToken(keyValue);
  });

  const { data: tokens, refetch } = useApiKeyQuery();

  const onTokenDelete = useEventCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setIsRefetch(_ => true);
  });

  useEffect(() => {
    if (!refetch) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refetch();
    setIsRefetch(_ => false);
  }, [refetch, isRefetch]);

  useEffect(() => {
    if (!generatedSucceed || !createdToken) return;
    setKeyValue(_ => createdToken);
    setInputDisabled(_ => true);
    setIsRefetch(_ => true);
    toast.success('API Generated', 'Your API Key has been generated!', {
      autoClose: 3000,
      closeButton: false,
    });
    toast.warning('Copy Your API Key!', 'You won\'t be able to copy this key anymore once you leave this page!', {
      autoClose: false,
      closeButton: true,
    });
  }, [generatedSucceed, generatedFailed, refetch, createdToken]);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="mb-4 text-xl font-semibold">Api Keys</div>
      <div className="text-lg font-semibold">
        Generate API Key
      </div>
      <div className="mb-4 flex flex-row justify-between gap-x-2 border-b-2 border-panel-border pb-8">
        <Input
          id="key-input"
          endIcons={inputDisabled
            ? [{
              icon: mdiClipboardTextOutline,
              className: 'text-panel-text-secondary',
              onClick: handleCopyToClipboard,
            }]
            : undefined}
          className="w-full xl:w-[65%]"
          disabled={inputDisabled}
          inputClassName="px-4 py-3"
          onChange={onKeyChange}
          type="text"
          value={keyValue}
          placeholder="Input API Indentifier"
        />
        <Button
          buttonType="primary"
          className="px-2 font-semibold"
          onClick={onGenerateClick}
        >
          Generate API Key
        </Button>
      </div>
      <div className="text-lg font-semibold">
        Issued API Keys
      </div>
      <div className="my-4 flex flex-col gap-y-2">
        {tokens?.map(token => <UserApiTokens key={uniqueId()} userInfo={token} onDeleteToken={onTokenDelete} />)}
      </div>
    </div>
  );
};

export default ApiKeys;
