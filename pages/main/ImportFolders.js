import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import TimeUpdated from './TimeUpdated';

class ImportFolders extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        const { items, isFetching, lastUpdated } = this.props;
        let files = [];
        let i=0;
        for (let key in items) {
            let item = items[key];
            i++;
            files.push(<tr key={i}><td>{i}</td><td>{item.ImportFolderLocation}</td><td></td></tr>);
        }
        return (
            <div className={this.props.className}>
                <section className="panel">
                    <header className="panel-heading">Import Folders</header>
                    <table className="table">
                        <thead>
                        <tr>
                            <th colSpan="3"><TimeUpdated timestamp={lastUpdated}/></th>
                        </tr>
                        </thead>
                        <tbody>
                        {files}
                        </tbody>
                    </table>
                </section>
            </div>
    );
    }
}

function mapStateToProps(state) {
    const { importFolders } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = importFolders || {
        isFetching: true,
        items: []
    };

    return {
        items,
        isFetching,
        lastUpdated
    }
}

export default connect(mapStateToProps)(ImportFolders)
