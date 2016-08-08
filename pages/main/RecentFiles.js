import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import TimeUpdated from './TimeUpdated';

class RecentFiles extends React.Component {
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
            files.push(<tr><td>{i}</td><td>{item}</td><td></td></tr>);
        }
        return (
            <div className={this.props.className}>
                <section className="panel">
                    <header className="panel-heading">
                        Recent files
                    </header>
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
    const { recentFiles } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = recentFiles || {
        isFetching: true,
        items: []
    };

    return {
        items,
        isFetching,
        lastUpdated
    }
}

export default connect(mapStateToProps)(RecentFiles)