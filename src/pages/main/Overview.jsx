// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Section, Tile, Level } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTv, faFolder, faServer } from '@fortawesome/free-solid-svg-icons';

type Props = {
  importCount: number,
  commandCount: number,
  seriesCount: number,
  filesCount: number,
}

class Overview extends React.Component<Props> {
  static propTypes = {
    importCount: PropTypes.number,
    commandCount: PropTypes.number,
    seriesCount: PropTypes.number,
    filesCount: PropTypes.number,
  };

  renderTile = (icon, count, text) => (
    <Tile kind="parent">
      <Tile renderAs="article" kind="child" className="box">
        <Level>
          <Level.Side align="left">
            <Level.Item><FontAwesomeIcon icon={icon} /></Level.Item>
          </Level.Side>
          <Level.Item renderAs="p" textAlignment="centered">{count}</Level.Item>
        </Level>
        <p className="subtitle">{text}</p>
      </Tile>
    </Tile>
  );

  render() {
    const {
      importCount, commandCount, seriesCount, filesCount,
    } = this.props;

    return (
      <Tile kind="ancestor" textAlignment="centered" className="overview">
        {this.renderTile(faSave, filesCount, 'files')}
        {this.renderTile(faTv, seriesCount, 'series')}
        {this.renderTile(faFolder, importCount, 'import folders')}
        {this.renderTile(faServer, commandCount, 'commands')}
      </Tile>
    );

    /*return (
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
    );*/
  }
}

function mapStateToProps(state) {
  const {
    importFolders, queueStatus, seriesCount, filesCount,
  } = state;

  const importCount = Object.keys(importFolders).length || 0;
  let commandCount = 0;
  try {
    commandCount = (Object.keys(queueStatus).length === 0
    && queueStatus.constructor === Object) ? 0
      : (
        (queueStatus.hash.count || 0)
        + (queueStatus.general.count || 0)
        + (queueStatus.image.count || 0)
      );
  } catch (ex) {
    commandCount = 0;
  }

  return {
    importCount,
    commandCount,
    seriesCount: seriesCount.count || 0,
    filesCount: filesCount.count || 0,
  };
}

export default connect(mapStateToProps, () => ({}))(Overview);
