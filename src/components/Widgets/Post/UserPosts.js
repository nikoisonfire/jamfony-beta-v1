import React, {useContext} from "react";
import {FirebaseContext} from "../../Firebase";
import {useQuery} from "react-query";
import Post from "./Post";
import Alert from "react-bootstrap/Alert";
import NoPostsFound from "./NoPostsFound";

/**
 *  Shows a users posts by their ID (in url).
 */
const UserPosts = ({userId}) => {
    const firebase = useContext(FirebaseContext);

    // Fetch Posts by user Id
    const getUserPosts = (key, userId) => {
        return new Promise((resolve, reject) => {
            firebase.getUserPosts(userId).then(
                snapshot => {
                    let posts = [];
                    snapshot.forEach(
                        doc => posts.push({...doc.data(), id: doc.id})
                    );
                    return resolve(posts);
                }
            ).catch(
                error => reject(error)
            );
        });
    };
    const {data, error} = useQuery(["posts", userId], getUserPosts);

    return (
        <div>
            {
                error ? <Alert variant="danger">Couldn't load posts, please reload the page and try again</Alert> :
                    data?.length > 0 ?
                        data.map(
                            dataEl => <Post key={dataEl.id} data={dataEl}/>
                        ) : <NoPostsFound/>
            }
        </div>
    );
};

export default UserPosts;