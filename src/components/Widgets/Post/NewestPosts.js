import React, {useContext} from "react";
import {FirebaseContext} from "../../Firebase";
import {useQuery} from "react-query";
import Post from "./Post";
import Alert from "react-bootstrap/Alert";
import NoPostsFound from "./NoPostsFound";

/**
 *  Shows the newest posts generally (used in <Feed />).
 */
const NewestPosts = () => {
    const firebase = useContext(FirebaseContext);
    const getPosts = (key, postId) => {
        return new Promise((resolve, reject) => {
            firebase.getNewestPosts().then(
                snapshot => {
                    let posts = [];
                    snapshot.forEach(
                        doc => posts.push({...doc.data(), id: doc.ref.id})
                    );
                    return resolve(posts);
                }
            ).catch(
                error => reject(error)
            );
        });
    };
    const {data, error} = useQuery(["posts", "newest"], getPosts);

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

export default NewestPosts;