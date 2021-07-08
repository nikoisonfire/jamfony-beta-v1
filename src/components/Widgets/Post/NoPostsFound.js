import React from 'react';

/**
 * Fallback if a band or user has no posts.
 */
const NoPostsFound = () => {
    return (
        <div className="post shadow rounded p-4 mb-4">
            <div className={"noPostsFound"}>
                <span>Drumroll please...</span>
                <span role="img" style={{fontSize: '60px'}}>🥁🥁🥁
                </span>
                <span>No Posts yet.</span>
            </div>
        </div>
    );
};

export default NoPostsFound;
