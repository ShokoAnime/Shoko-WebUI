import React, {PropTypes} from 'react';
import {connect} from 'react-redux';

class Overview extends React.Component {
    render() {
        const { importCount, commandCount, SeriesCount, FilesCount } = this.props;
        return (
            <div className="row overview">
                <div className="col-lg-3 col-sm-6">
                    <section className="panel">
                        <div className="symbol green">
                            <i className="fa fa-files-o"/>
                        </div>
                        <div className="value">
                            <h1>{FilesCount}</h1>
                            <p>Files</p>
                        </div>
                    </section>
                </div>
                <div className="col-lg-3 col-sm-6">
                    <section className="panel">
                        <div className="symbol red">
                            <i className="fa fa-television"/>
                        </div>
                        <div className="value">
                            <h1>{SeriesCount}</h1>
                            <p>Series</p>
                        </div>
                    </section>
                </div>
                <div className="col-lg-3 col-sm-6">
                    <section className="panel">
                        <div className="symbol yellow">
                            <i className="fa fa-folder-o"/>
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
                            <i className="fa fa-server"/>
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
        commandCount = (Object.keys(queueStatus.items).length === 0 && queueStatus.items.constructor === Object) ? 0 : ((queueStatus.items.hash.count || 0) + (queueStatus.items.general.count || 0) + (queueStatus.items.image.count || 0));
    } catch (ex) {
        console.log(ex);
    }
    const SeriesCount = seriesCount.count || 0;
    const FilesCount = filesCount.count || 0;

    return {
        importCount,
        commandCount,
        SeriesCount,
        FilesCount
    }
}

export default connect(mapStateToProps)(Overview)