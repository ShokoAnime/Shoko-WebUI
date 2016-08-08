import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import TimeUpdated from './TimeUpdated';

class News extends React.Component {
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
        files = <tr><td colSpan="3" className="text-center">Coming soon...</td></tr>
        return (
            <div className={this.props.className}>
                <section className="panel">
                    <header className="panel-heading">JMM News</header>
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
    const { jmmNews } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = jmmNews || {
        isFetching: true,
        items: []
    };

    return {
        items,
        isFetching,
        lastUpdated
    }
}

export default connect(mapStateToProps)(News)
