import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

class Overview extends React.Component {
  static propTypes = {
    importCount: PropTypes.number,
    commandCount: PropTypes.number,
    seriesCount: PropTypes.number,
    filesCount: PropTypes.number,
  };

  render() {
    const { importCount, commandCount, seriesCount, filesCount } = this.props;
    return (
      <div className="row overview">
        <div className="col-lg-3 col-sm-6">
          <section className="panel">
            <div className="symbol green">
              <i className="fa fa-files-o" />
            </div>
            <div className="value">
              <h1>{filesCount}</h1>
              <p>Files</p>
            </div>
          </section>
        </div>
        <div className="col-lg-3 col-sm-6">
          <section className="panel">
            <div className="symbol red">
              <i className="fa fa-television" />
            </div>
            <div className="value">
              <h1>{seriesCount}</h1>
              <p>Series</p>
            </div>
          </section>
        </div>
        <div className="col-lg-3 col-sm-6">
          <section className="panel">
            <div className="symbol yellow">
              <i className="fa fa-folder-o" />
            </div>
            <div className="value">
              <h1>{importCount}</h1>
              <p>Import Folders</p>
            </div>
          </section>
        </div>
        <div className="col-lg-3 col-sm-6">
          <section className="panel">
            <div className="symbol blue">
              <i className="fa fa-server" />
            </div>
            <div className="value">
              <h1>{commandCount}</h1>
              <p>Queued Commands</p>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { importFolders, queueStatus, seriesCount, filesCount } = state;

  const importCount = importFolders.items.length || 0;
  let commandCount = 0;
  try {
    commandCount = (Object.keys(queueStatus.items).length === 0
    && queueStatus.items.constructor === Object) ? 0
      : (
        (queueStatus.items.hash.count || 0) +
        (queueStatus.items.general.count || 0) +
        (queueStatus.items.image.count || 0)
    );
  } catch (ex) {
    commandCount = '--';
  }

  return {
    importCount,
    commandCount,
    seriesCount: seriesCount.items.count || 0,
    filesCount: filesCount.items.count || 0,
  };
}

export default connect(mapStateToProps)(Overview);
