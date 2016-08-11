import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import FixedPanel from '../../components/Panels/FixedPanel';

class ImportFolders extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        const { items, isFetching, lastUpdated } = this.props;
        let folders = [];
        let i=0;
        for (let key in items) {
            let item = items[key];
            i++;
            folders.push(<tr key={i}><td>{i}</td><td>{item.ImportFolderLocation}</td></tr>);
        }
        return (
            <div className={this.props.className}>
                <FixedPanel title="Import Folders Overview" description="Use Import Folders section to manage" lastUpdated={lastUpdated}>
                    <table className="table">
                        <tbody>
                        {folders}
                        </tbody>
                    </table>
                </FixedPanel>
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
