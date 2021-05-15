import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach, orderBy } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import cx from 'classnames';

import { RootState } from '../../../../core/store';
import Events from '../../../../core/events';
import Button from '../../../../components/Buttons/Button';

import type { RecentFileType } from '../../../../core/types/api/file';

type State = {
  expandedItems: any;
};

const epTypes = {
  Normal: 'E',
  Special: 'S',
  Parody: 'P',
  ThemeSong: 'C',
  Trailer: 'T',
  Other: 'O',
  Unknown: 'X',
};

class ImportedTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { items } = props;
    const expandedItems = {};

    forEach(items, (item) => {
      expandedItems[item.ID] = false;
    });

    this.state = {
      expandedItems,
    };
  }

  handleExpand = (item: RecentFileType) => {
    const { expandedItems } = this.state;
    const { getDetails } = this.props;

    expandedItems[item.ID] = !expandedItems[item.ID];

    const { SeriesIDs } = item;
    getDetails(item.ID, SeriesIDs[0].SeriesID.ID, SeriesIDs[0].EpisodeIDs[0].ID);

    this.setState({
      expandedItems,
    });
  };

  renderDate = (item: RecentFileType) => {
    const {
      expandedItems,
    } = this.state;
    return (
      <div key={`${item.ID}-date`} className="flex mt-3 first:mt-0">
        <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
        <Button
          className="color-highlight-1 ml-2"
          onClick={() => this.handleExpand(item)}
          tooltip={expandedItems[item.ID] ? 'Hide Details' : 'Show Details'}
        >
          {
            expandedItems[item.ID]
              ? <FontAwesomeIcon icon={faCaretUp} />
              : <FontAwesomeIcon icon={faCaretDown} />
          }
        </Button>
      </div>
    );
  };

  renderName = (idx: number, serverPath: string) => {
    const {
      expandedItems,
    } = this.state;
    return (
      <span key={`${idx}-name`} className={cx(['my-1 break-words', expandedItems[idx] && 'bg-color-4 px-3 py-1'])}>{serverPath}</span>
    );
  };

  renderDetails = (item: RecentFileType) => {
    const { expandedItems } = this.state;
    const { recentFileDetails } = this.props;
    const fileDetails = recentFileDetails[item.ID];
    const { fetched, details } = fileDetails ?? {};

    return (
      <div key={`${item.ID}-details`} className="flex">
        {
          expandedItems[item.ID] && (!fetched
            ? (
              <div className="flex px-4 flex-grow">
                <FontAwesomeIcon icon={faCircleNotch} spin className="text-2xl color-highlight-2" />
              </div>
            )
            : (
              <div className="flex flex-col flex-grow px-2">
                <div className="flex py-1 px-4">
                  <span className="w-1/6">Series</span>
                  {details.SeriesName ?? 'Unknown'}
                </div>
                <div className="flex py-1 px-4 bg-color-3">
                  <span className="w-1/6">Episode</span>
                  {`${(epTypes[details.EpisodeType ?? 'Unknown']) + details.EpisodeNumber}: ${details.EpisodeName ?? 'Unknown'}`}
                </div>
                <div className="flex py-1 px-4">
                  <span className="w-1/6">Group</span>
                  {details.ReleaseGroup ?? 'Unknown'}
                </div>
                <div className="flex py-1 px-4 bg-color-3">
                  <span className="w-1/6">Size</span>
                  {prettyBytes(item.Size, { binary: true })}
                </div>
                <div className="flex py-1 px-4">
                  <span className="w-1/6">Video Info</span>
                  {this.getFileInfo(
                    item.RoundedStandardResolution,
                    details.Source,
                    details.AudioLanguages,
                    details.SubtitleLanguages,
                    details.VideoCodec,
                  )}
                </div>
              </div>
            )
          )
        }
      </div>
    );
  };

  getFileInfo = (
    resolution = 'Unknown',
    source = 'Unknown',
    audioLanguages: Array<string> = [],
    subtitleLanguages: Array<string> = [],
    videoCodec = 'Unknown',
  ) => {
    let info = `${resolution} | ${videoCodec} | ${source.toUpperCase()} | `;
    if (audioLanguages.length > 2) info += 'Multi Audio';
    else if (audioLanguages.length === 2) info += 'Dual Audio';
    else if (subtitleLanguages[0] !== 'none') info += 'Subbed';
    else info += 'Raw';

    return info;
  };

  render() {
    const { items } = this.props;

    const sortedItems = orderBy(items, ['ID'], ['desc']);
    const files: Array<any> = [];

    forEach(sortedItems, (item) => {
      if (item?.SeriesIDs && item?.Locations && item?.Locations?.length !== 0) {
        files.push(this.renderDate(item));
        files.push(this.renderName(item.ID, item.Locations[0].RelativePath));
        files.push(this.renderDetails(item));
      }
    });

    if (files.length === 0) {
      return (<div className="flex justify-center font-bold mt-4" key="no-imported">No imported files!</div>);
    }

    return files;
  }
}

const mapState = (state: RootState) => ({
  items: state.mainpage.recentFiles as Array<RecentFileType>,
  recentFileDetails: state.mainpage.recentFileDetails,
});

const mapDispatch = {
  getDetails: (fileId: number, seriesId: number, episodeId: number) => (
    { type: Events.MAINPAGE_RECENT_FILE_DETAILS, payload: { fileId, seriesId, episodeId } }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportedTab);
