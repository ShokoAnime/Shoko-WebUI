import React, {PropTypes} from 'react';
import FixedPanel from '../../components/Panels/FixedPanel';

class QuickActions extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        const { items, isFetching, lastUpdated } = this.props;
        let actions = [];

        return (
            <div className={this.props.className}>
                <FixedPanel title="Quick Actions" lastUpdated={lastUpdated}>
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
