
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import * as prettyBytes from 'pretty-bytes';
import * as dateFormat from 'dateformat';
import FixedPanel from '../../components/Panels/FixedPanel';
import Button from '../../components/Buttons/Button';

type RecentFileType = {
  id: number;
  filename: string;
  recognized: boolean;
  created: Date;
  updated: Date;
  server_path: string;
  size: number;
  epnumber: number;
  epname: string;
  eptype: string;
  name: string;
  source: string;
  audioLanguages: Array<string>;
  subtitleLanguages: Array<string>;
  resolution: string;
};

type StateProps = {
  items?: Array<RecentFileType>;
};

type Props = StateProps;

type State = {
  expandedItems: any;
};

class ImportBreakdown extends React.Component<Props, State> {
  static propTypes = {
    items: PropTypes.array,
  };

  constructor(props) {
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

  renderDate = (idx: number, date: Date) => {
    const {
      expandedItems,
    } = this.state;
    return (
      <tr key={`date-${idx}`}>
        <td className="pt-3 font-muli font-bold">
          {dateFormat(date, 'yyyy-mm-dd')} / {dateFormat(date, 'hh:MM:ss TT')}
          <Button className="color-accent mx-2" onClick={() => this.handleExpand(idx)}>
            {
              expandedItems[idx]
                ? <FontAwesomeIcon icon={faCaretUp} />
                : <FontAwesomeIcon icon={faCaretDown} />
            }
          </Button>
        </td>
      </tr>
    );
  };

  renderName = (idx: number, serverPath: string) => (
    <tr key={`filename-${idx}`}>
      <td className="pt-1">{serverPath}</td>
    </tr>
  );

  renderDetails = (idx: number, item: RecentFileType) => {
    const {
      expandedItems,
    } = this.state;

    return (
      <tr key={`details-${idx}`}>
        <td>
          {expandedItems[idx] && (
          <table className="table-auto w-full">
            <tbody>
              <tr>
                <td className="font-muli font-bold px-4 pt-1 w-1/12">
                  Series
                </td>
                <td className="pt-1">{item.name || 'Unknown'}</td>
              </tr>
              <tr>
                <td className="font-muli font-bold px-4 pt-1 w-1/12">
                  Episode
                </td>
                <td className="pt-1">
                  {this.getEpisodeName(item.eptype, item.epnumber, item.epname)}
                </td>
              </tr>
              <tr>
                <td className="font-muli font-bold px-4 pt-1 w-1/12">Size</td>
                <td className="pt-1">{prettyBytes(item.size)}</td>
              </tr>
              <tr>
                <td className="font-muli font-bold px-4 pt-1 w-1/12">Info</td>
                <td className="pt-1">
                  {this.getFileInfo(
                    item.resolution,
                    item.source,
                    item.audioLanguages,
                    item.subtitleLanguages,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          )}
        </td>
      </tr>
    );
  };

  getEpisodeName = (eptype: string, epnumber: number, epname: string) => {
    if (!eptype) return 'Unknown';

    let epTypeCode = '';
    if (eptype === 'Credits') epTypeCode = 'C'; else if (eptype === 'Special') epTypeCode = 'S'; else if (eptype === 'Episode') epTypeCode = 'E'; else epTypeCode = 'X';

    return `${epTypeCode + epnumber}: ${epname}`;
  };

  getFileInfo = (
    resolution: string,
    source: string,
    audioLanguages: Array<string>,
    subtitleLanguages: Array<string>,
  ) => {
    let info = `${resolution.toUpperCase()} / `;
    if (audioLanguages.length > 2) info += 'Multi Audio';
    else if (audioLanguages.length === 2) info += 'Dual Audio';
    else if (subtitleLanguages[0] !== 'none') info += 'Subbed';
    else info += 'Raw';

    return info;
  };

  render() {
    const {
      items,
    } = this.props;
    const files: any[] = [];
    let i = 0;

    forEach(items, (item) => {
      i += 1;
      files.push(this.renderDate(i, item.created));
      files.push(this.renderName(i, item.server_path));
      files.push(this.renderDetails(i, item));
    });

    return <FixedPanel title="Import Breakdown">{files}</FixedPanel>;
  }
}

function mapStateToProps(state): StateProps {
  const {
    recentFiles,
  } = state;

  return {
    items: recentFiles,
  };
}

export default connect(mapStateToProps, () => ({}))(ImportBreakdown);
