import React, { useEffect, useState } from 'react';
import { mdiClipboardTextOutline } from '@mdi/js';
import cx from 'classnames';
import { sortBy } from 'lodash';
import { useCopyToClipboard } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useCreateApiToken, useDeleteApiToken } from '@/core/react-query/auth/mutations';
import { useApiKeyQuery } from '@/core/react-query/auth/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import useEventCallback from '@/hooks/useEventCallback';

import type { AuthToken } from '@/core/types/api/authToken';

const UserApiTokens = (prop: { userInfo: AuthToken }) => {
  const { userInfo: { Device, Username } } = prop;
  const { mutate: deleteToken } = useDeleteApiToken();

  const onDeleteClick = useEventCallback(() => {
    deleteToken(Device, {
      onSuccess: (() => {
        toast.success('API Key Deleted', `API Key ${Device} has been deleted!`, {
          autoClose: 3000,
        });
        invalidateQueries(['auth', 'apikey']);
      }),
    });
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
  const [inputDisabled, setInputDisabled] = useState(false);
  const [, copy] = useCopyToClipboard();
  const onKeyChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyValue(event.target.value);
  });

  const {
    data: createdToken,
    isSuccess: generatedSucceed,
    mutate: createApiToken,
  } = useCreateApiToken();

  const handleCopyToClipboard = useEventCallback(() => {
    if (!generatedSucceed) return;
    copy(keyValue).then((isCopied) => {
      if (!isCopied) return;
      toast.success('Copied', 'API Key has been copied to clipboard!', {
        autoClose: 3000,
        toastId: 'api-copied',
      });
    }).catch(console.error);
  });

  const onGenerateClick = useEventCallback(() => {
    createApiToken(keyValue, {
      onSuccess: () => {
        setInputDisabled(_ => true);
        toast.success('API Generated', 'API Key has been generated!', {
          autoClose: 3000,
          toastId: 'api-generated',
        });
        toast.warning('Copy Your API Key!', 'You won\'t be able to copy this key anymore once you leave this page!', {
          autoClose: 99999999999,
          toastId: 'copy-api-key',
        });
        invalidateQueries(['auth', 'apikey']);
      },
    });
  });

  const { data: tokens } = useApiKeyQuery();

  useEffect(() => {
    if (!generatedSucceed || !createdToken) return undefined;
    setKeyValue(createdToken);
    setInputDisabled(true);
    return () => {
      if (toast.isActive('copy-api-key')) {
        toast.dismiss('copy-api-key');
      }
      if (toast.isActive('api-generated')) {
        toast.dismiss('api-generated');
      }
      if (toast.isActive('api-copied')) {
        toast.dismiss('api-copied');
      }
    };
  }, [generatedSucceed, createdToken]);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="mb-4 text-xl font-semibold">API Keys</div>
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
          className={cx(!generatedSucceed ? 'w-full xl:w-[65%]' : 'w-[100%]')}
          disabled={inputDisabled}
          inputClassName="px-4 py-3"
          onChange={onKeyChange}
          type="text"
          value={keyValue}
          placeholder="Input API Indentifier"
        />
        <Button
          buttonType="primary"
          className={cx('px-2 font-semibold', generatedSucceed && 'hidden')}
          onClick={onGenerateClick}
        >
          Generate API Key
        </Button>
      </div>
      <div className="text-lg font-semibold">
        Issued API Keys
      </div>
      <div className="my-4 flex flex-col gap-y-2">
        {sortBy(tokens, x => x.UserID)?.map(token => (
          <UserApiTokens key={`${token.Username}-${token.Device}`} userInfo={token} />
        ))}
      </div>
    </div>
  );
};

export default ApiKeys;
