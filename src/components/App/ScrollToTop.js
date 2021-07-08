import React, {Fragment, useEffect} from 'react';
import {withRouter} from 'react-router-dom';

/**
 *  Scrolls to the top of the window (like a regular <a>) when the history changes (e.g. history.push())
 */
const ScrollToTop = ({history, children}) => {
    useEffect(() => {
        const unlisten = history.listen(() => {
            window.scrollTo(0, 0);
        });
        return () => {
            unlisten();
        }
    }, [history]);

    return <Fragment>{children}</Fragment>;
}

export default withRouter(ScrollToTop);