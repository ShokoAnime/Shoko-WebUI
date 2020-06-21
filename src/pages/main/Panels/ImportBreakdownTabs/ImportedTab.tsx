import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';

import { RootState } from '../../../../core/store';
import Button from '../../../../components/Buttons/Button';
import type { RecentFileType } from '../../../../core/types/api';

type State = {
  expandedItems: any;
};

class ImportedTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { items } = props;
    const expandedItems = {};

    forEach(items, (item) => {
      expandedItems[item.id] = false;
    });

    this.state = {
      expandedItems,
    };
  }

  handleExpand = (idx: number) => {
    const {
      expandedItems,
    } = this.state;

    expandedItems[idx] = !expandedItems[idx];

    this.setState({
      expandedItems,
    });
  };

  renderDate = (idx: number, date: string) => {
    const {
      expandedItems,
    } = this.state;
    return (
      <div key={`${idx}-date`} className="flex mt-2">
        <span className="font-semibold">{moment(date).format('yyyy-MM-DD')} / {moment(date).format('hh:mm A')}</span>
        <Button className="color-accent ml-2" onClick={() => this.handleExpand(idx)}>
          {
            expandedItems[idx]
              ? <FontAwesomeIcon icon={faCaretUp} />
              : <FontAwesomeIcon icon={faCaretDown} />
          }
        </Button>
      </div>
    );
  };

  renderName = (idx: number, serverPath: string) => (
    <span key={`${idx}-name`} className="my-2 break-words">{serverPath}</span>
  );

  renderDetails = (idx: number, item: RecentFileType) => {
    const { expandedItems } = this.state;
    const { isFetching } = this.props;

    return (
      <div key={`${idx}-details`} className="flex mb-1">
        {
          expandedItems[idx] && (isFetching
            ? (
              <div className="flex px-4 flex-grow">
                <FontAwesomeIcon icon={faCircleNotch} spin className="text-2xl color-accent-secondary" />
              </div>
            )
            : (
              <div className="flex flex-col px-4 flex-grow">
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Series</span>
                  {item.name ?? 'Unknown'}
                </div>
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Episode</span>
                  {this.getEpisodeName(item.eptype, item.epnumber, item.epname)}
                </div>
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Size</span>
                  {prettyBytes(item.size)}
                </div>
                <div className="flex mb-2">
                  <span className="w-1/6 font-semibold">Info</span>
                  {this.getFileInfo(
                    item.resolution,
                    item.source,
                    item.audioLanguages,
                    item.subtitleLanguages,
                  )}
                </div>
              </div>
            )
          )
        }
      </div>
    );
  };

  getEpisodeName = (eptype: string, epnumber: number, epname: string) => {
    if (!eptype) return 'Unknown';

    let epTypeCode = '';
    if (eptype === 'Credits') epTypeCode = 'C'; else if (eptype === 'Special') epTypeCode = 'S'; else if (eptype === 'Episode') epTypeCode = 'E'; else epTypeCode = 'X';

    return `${epTypeCode + epnumber}: ${epname}`;
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

    forEach(items, (item, idx) => {
      files.push(this.renderDate(idx, item.created));
      files.push(this.renderName(idx, item.server_path));
      files.push(this.renderDetails(idx, item));
    });

    return files;
  }
}

const mapState = (state: RootState) => ({
  isFetching: state.fetching.recentFileDetails,
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector> & {
  items: Array<RecentFileType>;
};

export default connector(ImportedTab);
