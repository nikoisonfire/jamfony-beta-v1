import React, {useContext} from "react";
import {FirebaseContext} from "../../Firebase";
import {useQuery} from "react-query";
import Post from "./Post";
import Alert from "react-bootstrap/Alert";
import NoPostsFound from "./NoPostsFound";

/**
 *  Shows a bands' posts. Usually used in <BandProfile />
 */
const BandPosts = props => {
    const firebase = useContext(FirebaseContext);
    const getBandPosts = (key, bandId) => {
        return new Promise((resolve, reject) => {
            firebase.getUserPosts(bandId).then(
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
    const {data, error} = useQuery(["posts", props.bandId], getBandPosts);

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

export default BandPosts;