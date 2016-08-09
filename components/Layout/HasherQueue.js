import React from 'react';

class HasherQueue extends React.Component {
    render() {
        const { count } = this.props;
        return (
            <li className="notification">
                <a className="dropdown-toggle" href="#">
                    <i className="fa fa-tasks"/>
                    {count == null?null:<span className="badge bg-important">{count}</span>}
                </a>
            </li>
        );
    }
}

export default HasherQueue;