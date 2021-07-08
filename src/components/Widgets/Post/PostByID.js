import React, {useContext} from "react";
import {FirebaseContext} from "../../Firebase";
import {useQuery} from "react-query";
import Post from "./Post";
import NotFoundPage from "../../ErrorPages/NotFoundPage";
import {useParams} from "react-router-dom";

/**
 *  Get a single post as a page by ID.
 */
const PostByID = () => {
    const firebase = useContext(FirebaseContext);
    let {postId} = useParams();
    const getPosts = (key, postId) => {
        return new Promise((resolve, reject) => {
            firebase.getSinglePost(postId).then(
                doc => resolve({...doc.data(), id: doc.ref.id})
            ).catch(
                error => reject(error)
            );
        });
    };
    const {data} = useQuery(['post', postId], getPosts);

    return (
        <div className="singlePost p-4">
            {
                !data ? <NotFoundPage title="Post"/> :
                    <Post data={data}/>
            }
        </div>
    );
};

export default PostByID;