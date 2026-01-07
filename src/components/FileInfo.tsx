import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiClipboardOutline } from '@mdi/js';
import Icon from '@mdi/react';
import prettyBytes from 'pretty-bytes';

import { copyToClipboard } from '@/core/util';
import getEd2kLink from '@/core/utilities/getEd2kLink';
import useEventCallback from '@/hooks/useEventCallback';
import useMediaInfo from '@/hooks/useMediaInfo';

import type { FileType } from '@/core/types/api/file';

const FileInfo = ({ compact, file }: { compact?: boolean, file: FileType }) => {
  const { t } = useTranslation('series');
  const mediaInfo = useMediaInfo(file);

  const hash = useMemo(() => getEd2kLink(file), [file]);
  const handleCopy = useEventCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    copyToClipboard(hash, t('files.fileInfo.copiedMessage')).catch(console.error);
  });

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-4">
        {!compact && <div className="text-xl font-semibold opacity-65">{t('files.fileInfo.title')}</div>}
        <div className="flex flex-col gap-y-1">
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.fileName')}</div>
            {mediaInfo.Name}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.location')}</div>
            {mediaInfo.Location}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.size')}</div>
            {prettyBytes(mediaInfo.Size, { binary: true })}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.group')}</div>
            {mediaInfo.Group}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.video')}</div>
            {mediaInfo.VideoInfo.join(' | ')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.audio')}</div>
            {mediaInfo.AudioInfo.join(' | ')}
          </div>
          <div className="flex">
            <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.chapters')}</div>
            {mediaInfo.Chapters ? t('files.fileInfo.yes') : t('files.fileInfo.no')}
          </div>
          {compact && (
            <div className="flex">
              <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.crc')}</div>
              {mediaInfo.Hashes.CRC32 ?? ''}
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col gap-y-4">
          <div className="text-xl font-semibold opacity-65">{t('files.fileInfo.hashesTitle')}</div>
          <div className="flex flex-col gap-y-1">
            <div className="flex">
              <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.ed2k')}</div>
              <div className="flex gap-x-2">
                {mediaInfo.Hashes.ED2K ?? ''}
                <div className="cursor-pointer text-panel-icon-action" onClick={handleCopy}>
                  <Icon path={mdiClipboardOutline} size={1} />
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.crc')}</div>
              {mediaInfo.Hashes.CRC32 ?? ''}
            </div>
            <div className="flex">
              <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.sha1')}</div>
              {mediaInfo.Hashes.SHA1 ?? ''}
            </div>
            <div className="flex">
              <div className="min-w-[9.375rem] font-semibold">{t('files.fileInfo.md5')}</div>
              {mediaInfo.Hashes.MD5 ?? ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInfo;
