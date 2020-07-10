import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';

import { RootState } from '../../../../core/store';
import Events from '../../../../core/events';
import Button from '../../../../components/Buttons/Button';

import type { RecentFileType } from '../../../../core/types/api/file';

type State = {
  expandedItems: any;
};

const epTypes = ['X', 'E', 'C', 'S', 'T', 'P', 'O'];

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
      <div key={`${item.ID}-date`} className="flex mt-3">
        <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
        <Button
          className="color-accent ml-2"
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

  renderName = (idx: number, serverPath: string) => (
    <span key={`${idx}-name`} className="my-1 break-words">{serverPath}</span>
  );

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
                <FontAwesomeIcon icon={faCircleNotch} spin className="text-2xl color-accent-secondary" />
              </div>
            )
            : (
              <div className="flex flex-col px-4 flex-grow">
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Series</span>
                  {details.SeriesName ?? 'Unknown'}
                </div>
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Episode</span>
                  {`${(epTypes[details.EpisodeType ?? 0] ?? 'X') + details.EpisodeNumber}: ${details.EpisodeName ?? 'Unknown'}`}
                </div>
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Size</span>
                  {prettyBytes(item.Size)}
                </div>
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Info</span>
                  {this.getFileInfo(
                    item.RoundedStandardResolution,
                    details.Source,
                    details.AudioLanguages,
                    details.SubtitleLanguages,
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
  ) => {
    let info = `${resolution.toUpperCase()} / ${source} / `;
    if (audioLanguages.length > 2) info += 'Multi Audio';
    else if (audioLanguages.length === 2) info += 'Dual Audio';
    else if (subtitleLanguages[0] !== 'none') info += 'Subbed';
    else info += 'Raw';

    return info;
  };

  render() {
    const { items } = this.props;

    const files: Array<any> = [];

    forEach(items, (item) => {
      files.push(this.renderDate(item));
      files.push(this.renderName(item.ID, item.Locations[0].RelativePath));
      files.push(this.renderDetails(item));
    });

    if (files.length === 0) {
      files.push(<div className="flex justify-center font-bold mt-4">No imported files!</div>);
    }

    return files;
  }
}

const mapState = (state: RootState) => ({
  recentFileDetails: state.mainpage.recentFileDetails,
});

const mapDispatch = {
  getDetails: (fileId: number, seriesId: number, episodeId: number) => (
    { type: Events.MAINPAGE_RECENT_FILE_DETAILS, payload: { fileId, seriesId, episodeId } }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  items: Array<RecentFileType>;
};

export default connector(ImportedTab);
