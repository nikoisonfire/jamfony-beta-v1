import React, {useContext, useState} from "react";
import ProfilePicSmall from "../ProfilePicSmall";
import UilClock from "@iconscout/react-unicons/icons/uil-clock";
import UilShareAlt from "@iconscout/react-unicons/icons/uil-share-alt";
import UilCommentAlt from "@iconscout/react-unicons/icons/uil-comment-alt";
import LoveButton from "../../Buttons/LoveButton";
import {formatDateLong, formatTime, getCorrectRoute, timeSince, uuidv4} from "../../../constants/timeHelpers";
import sessionStore from "../../../recoil/sessionStore";
import {useRecoilValue} from "recoil";
import ReactPlayer from "react-player/lazy";
import {FirebaseContext} from "../../Firebase";
import Button from "react-bootstrap/Button";
import AddComment from "../../Forms/AddComment";
import PostComment from "./PostComment";
import {Link} from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import UilCommentAltEdit from "@iconscout/react-unicons/icons/uil-comment-alt-edit";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import DropdownItem from "react-bootstrap/DropdownItem";
import UilEdit from "@iconscout/react-unicons/icons/uil-edit";
import UilTimesCircle from "@iconscout/react-unicons/icons/uil-times-circle";
import SharePostModal from "../../Modals/SharePostModal";
import Form from "react-bootstrap/Form";
import UploadPictureButton from "../../Buttons/UploadPictureButton";
import {queryCache} from "react-query";
import Spinner from "react-bootstrap/Spinner";
import ConfirmModal from "../../Modals/ConfirmModal";
import options from "../../../constants/options";
import Badge from "react-bootstrap/Badge";
import UilMapMarker from "@iconscout/react-unicons/icons/uil-map-marker";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";
import UilClockSeven from "@iconscout/react-unicons/icons/uil-clock-seven";


// FIXME: add a better Anti Abuse logic


/**
 *  Site-wide Post Component.
 */
const Post = ({data}) => {
    // "Bad" Anti abuse logic counter for likes, comments, etc.
    const [operationsCounter, setCounter] = useState(0);

    const firebase = useContext(FirebaseContext);
    const user = useRecoilValue(sessionStore).user;

    // Check private access
    const isMe = data.user.id === user.id;
    const isMyBand = user.bands?.some(x => x.id === data.user.id);

    // States
    const [loveButtonActive, setLoveButtonActive] = useState(data.likes.includes(user.id));
    const [commentForm, setCommentForm] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [confirmDelete, showConfirmDelete] = useState(false);

    /**
     *  Show / Hide Post "Share" Dialog
     */
    const handleModalShow = () => setShowShare(oldVal => !oldVal);

    /**
     * Toggle writing a new comment.
     */
    const toggleCommentButton = () => setCommentForm(oldVal => !oldVal);

    const comments = data.comments;

    /**
     *  POST ACTIONS
     */

    /**
     *  Handle Like / Dislike Button
     */
    const handleLoveButton = () => {
        if (!loveButtonActive) {
            // Update -> Add Like
            if (operationsCounter < 2) {
                firebase.updatePostLikes(data.id, user.id)
                    .then(() => {
                        /** Send Notification if a post is liked to poster **/
                        if (user.id !== data.user.id)
                            firebase.sendNotification({
                                id: user.id,
                                name: user.name,
                                picture: user.picture
                            }, data.user.id, "likedPost", ROUTES.POSTS + '/' + data.id)
                    })
                    .then(() => {
                        data.likes.push(user.id);
                        setCounter(operationsCounter + 1);
                        setLoveButtonActive(true);
                    })
                    .catch(error => console.log(error));
            }
        }
        if (loveButtonActive) {
            // Update -> Remove Like
            if (operationsCounter < 2) {
                firebase.updatePostLikes(data.id, user.id, true)
                    .then(() => {
                        data.likes = data.likes.filter(el => el !== user.id);
                        setCounter(operationsCounter + 1);
                        setLoveButtonActive(false);
                    })
                    .catch(error => console.log(error));
            }
        }
    };

    /**
     *  Add Comment to post by text
     */
    const addComment = (text) => {
        const comment = {
            text: text,
            likes: [],
            id: user.id
        };
        const commenter = {
            id: user.id,
            name: user.name,
            picture: user.picture
        };
        firebase.addCommentToPost(data.id, comment, commenter)
            .then(() => {
                /** Send Notification if a comment is posted to poster **/
                if (user.id !== data.user.id)
                    firebase.sendNotification({
                            id: user.id,
                            name: user.name,
                            picture: user.picture
                        }, data.user.id,
                        "commentedMyPost", ROUTES.POSTS + '/' + data.id);
                /** Send to other users **/
                if (data.commenters.length > 0) {
                    data.commenters.map(
                        el => {
                            if (el.id !== user.id) {
                                firebase.sendNotification({
                                        id: user.id,
                                        name: user.name,
                                        picture: user.picture
                                    }, el.id,
                                    "commentedPost", ROUTES.POSTS + '/' + data.id);
                            }
                        }
                    );
                }
            })
            .then(() => {
                comments.push(comment);
                data.commenters.push(commenter);
                setCommentForm(null);
            })
            .catch(error => console.log(error));
    };

    /**
     *   Edit Post Form Stuff.
     */
    const [form, setForm] = useState({
        text: data.text || '',
        link: data.link || '',
        cover: data.cover || ''
    });
    const [isValidated, setValidated] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const handleChange = event => setForm({...form, [event.target.name]: event.target.value});
    const handleImg = url => setForm({...form, cover: url});
    const postImgPath = "posts/" + uuidv4();
    const editPost = event => {

        event.preventDefault();

        const cur = event.currentTarget;
        if (cur.checkValidity() === false) {
            event.stopPropagation();
        }

        setValidated(true);

        // Form is valid
        if (cur.checkValidity() === true) {
            // Set Spinner
            setLoading(true);

            firebase.updatePost(data.id, form)
                .then(() => {


                    queryCache.setQueryData(["posts", "newest"], oldData => {
                        const replIndex = oldData.findIndex(x => x.id === data.id);
                        oldData[replIndex] = {
                            ...data,
                            ...form
                        };
                        return oldData;
                    });
                    queryCache.setQueryData(["posts", data.user.id], oldData => {
                        const replIndex = oldData.findIndex(x => x.id === data.id);
                        oldData[replIndex] = {
                            ...data,
                            ...form
                        };
                        return oldData;
                    });

                })
                .catch(error => console.log("Error: " + error));

            setLoading(false);
            setEditMode(false);
        }
    };
    /**
     *  Delete Post after Confirmation
     */
    const deletePost = () => {
        firebase.deletePost(data.id)
            .then(() => {
                queryCache.setQueryData(["posts", "newest"], oldData => {
                    oldData.splice(oldData.findIndex(x => x.id === data.id), 1);
                    return oldData;
                });
                queryCache.setQueryData(["posts", data.user.id], oldData => {
                    oldData.splice(oldData.findIndex(x => x.id === data.id), 1);
                    return oldData;
                });
            })
            .catch(error => console.log("Error: " + error));
    };

    const iconSize = 24;

    return (
        <div className="post shadow rounded p-4 mb-4">
            <div className="postHeader">
                <div className="postProfile">
                    <ProfilePicSmall src={data.user.picture}/>
                    <div className="postInfo">
                        <div className="postAuthor">
                            <Link to={getCorrectRoute(data.page) + "/" + data.user.id}>{data.user.name}</Link>
                        </div>
                        <div className="postTimestamp">
                            <UilClock size="11"/>
                            <span>{timeSince(data.timestamp)} ago</span>
                        </div>
                    </div>
                </div>
                {isMe || isMyBand ?
                    <div className="postHeaderDropdown">
                        {confirmDelete ? <ConfirmModal onConfirmed={deletePost}
                                                       callback={() => showConfirmDelete(false)}
                                                       text="Are you sure you want to delete this post?"/> : undefined}
                        <Dropdown>
                            <DropdownToggle id="postcomment-edit-delete" variant="link">
                                <UilCommentAltEdit size={14}/> Edit
                            </DropdownToggle>
                            <DropdownMenu alignRight>
                                <DropdownItem onClick={() => setEditMode(true)} disabled={editMode}><UilEdit
                                    size={18}/> Edit
                                    Post</DropdownItem>
                                <DropdownItem onClick={() => showConfirmDelete(true)}><UilTimesCircle size={18}/> Delete
                                    Post</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div> : null}
            </div>
            <div className="postContent">
                <Form noValidate validated={isValidated} onSubmit={editPost}>
                    <p>
                        {editMode ?
                            <Form.Control
                                required
                                name="text"
                                type="textarea"
                                as="textarea"
                                minLength="30"
                                size="lg"
                                onChange={handleChange}
                            >
                                {data.text}
                            </Form.Control>
                            : data.text}
                    </p>
                    {
                        data.link !== "" && data.link ?
                            editMode ?
                                <Form.Control
                                    type="text"
                                    name="link"
                                    defaultValue={data.link}
                                    onChange={handleChange}
                                />
                                : <ReactPlayer url={data.link} width="100%" height="280px"/> : undefined}

                    {
                        data.cover !== "" && data.cover ?
                            editMode ?
                                <Form.Group controlId="addCover">
                                    <UploadPictureButton path={postImgPath} callback={handleImg}/>
                                </Form.Group>
                                : <div className="postImage"><img src={data.cover}/></div> : undefined}
                    {
                        data.event ?
                            <div className={"eventPost"} style={{backgroundImage: `url(${data.event.banner})`}}>
                                <div className={"title"}>
                                    <Link to={ROUTES.EVENTS + '/' + data.event.id}>{data.event.name}</Link>
                                    <Badge variant={"info"}>
                                        {
                                            options.eventTypes.find(x => x.value === data.event.type).label
                                        }
                                    </Badge>
                                </div>
                                <div className={"details"}>
                                    <span><UilMapMarker/> {data.event.location}</span>
                                    <span><UilCalendarAlt/> {formatDateLong(data.event.startTime)}</span>
                                    <span><UilClockSeven/> {formatTime(data.event.startTime)}</span>
                                </div>
                            </div> : null
                    }
                    {editMode ?
                        <Button type="submit" block>
                            {
                                isLoading ?
                                    <Spinner animation="border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </Spinner> : "Save"
                            }
                        </Button> : undefined}
                </Form>
            </div>
            <div className="postFooter">
                <div className="postActions">
                    <div className="postActionsPrimary">
                        <LoveButton size={iconSize} textSize={14} hearts={data.likes.length}
                                    callback={handleLoveButton} initialActive={loveButtonActive}/>
                    </div>
                    <div className="postActionsSecondary">
                        <div className="postFooterComment">
                            <Button variant="link" onClick={toggleCommentButton} disabled={(commentForm == null)}>
                                <UilCommentAlt size={iconSize}/>
                            </Button>
                        </div>
                        <div className="postFooterShare">
                            <a href="#">
                                {showShare ?
                                    <SharePostModal url={ROUTES.ROOTDOMAIN + "/posts/" + data.id} show={showShare}
                                                    callback={handleModalShow}/> : null}
                                <Button variant="link" onClick={handleModalShow}>
                                    <UilShareAlt size={iconSize}/>
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="pb-2">
                    {commentForm ? <AddComment callback={addComment}/> : null}
                </div>
                {comments.map(
                    (el, key) => {
                        const commentGuy = data.commenters?.find(commenter => commenter.id === el.id);
                        return <PostComment key={uuidv4()}
                                            comment={el}
                                            commenter={commentGuy}
                                            allComments={comments}
                                            commentKey={key}
                                            userId={user.id}
                                            postId={data.id}
                        />
                    }
                )}
            </div>
        </div>
    );
};

export default Post;