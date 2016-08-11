import React, {PropTypes} from 'react';
import FixedPanel from '../../components/Panels/FixedPanel';

class QuickActions extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        const { items, isFetching, lastUpdated } = this.props;
        let shouldComeFromStore = ["Run Import","Update Images","Sync Votes","Remove Missing Files","Update All Stats","Update All TvDB Info"];
        let actions = [];

        for (let [index, item] of shouldComeFromStore.entries()) {
            actions.push(<tr key={index}>
                <td>{index+1}</td>
                <td>{item}</td>
                <td className="text-right">
                    <span className="badge bg-success">Coming soon...</span>
                </td>
            </tr>);
        }

        return (
            <div className={this.props.className}>
                <FixedPanel title="Quick Actions" description="Can be changed on the Actions tab" lastUpdated={lastUpdated}>
                    <table className="table">
                        <tbody>
                        {actions}
                        </tbody>
                    </table>
                </FixedPanel>
            </div>
    );
    }
}

export default QuickActions
