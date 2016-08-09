import React from 'react';

class ImageQueue extends React.Component {
    render() {
        const { count } = this.props;
        return (
            <li className="notification">
                <a className="dropdown-toggle" href="#">
                    <i className="fa fa-picture-o"/>
                    {count == null?null:<span className="badge bg-error">{count}</span>}
                </a>
            </li>
        );
    }
}

export default ImageQueue;