import React, {useContext, useState} from "react";
import {FirebaseContext} from "../../Firebase";
import ProfilePicSmall from "../ProfilePicSmall";
import LoveButton from "../../Buttons/LoveButton";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import UilCommentAltEdit from "@iconscout/react-unicons/icons/uil-comment-alt-edit";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import DropdownItem from "react-bootstrap/DropdownItem";
import UilEdit from "@iconscout/react-unicons/icons/uil-edit";
import UilTimesCircle from "@iconscout/react-unicons/icons/uil-times-circle";
import * as ROUTES from "../../../constants/routes";
import {Link} from "react-router-dom";
import ConfirmModal from "../../Modals/ConfirmModal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import {useRecoilValue} from "recoil";
import sessionStore from "../../../recoil/sessionStore";

/**
 *     Single comment in Post - Component.
 */
const PostComment = props => {
    const firebase = useContext(FirebaseContext);
    const user = useRecoilValue(sessionStore).user;

    const {
        comment,
        commenter: {id, name, picture},
        commentKey,
        userId,
        postId,
        allComments
    } = props;

    /** States **/
    const [loveButtonActive, setLoveButtonActive] = useState(comment.likes.includes(userId));
    const [editModeComment, setEditComment] = useState(false);
    const [confirmDelete, showConfirmDelete] = useState(false);


    /** Edit Form Submission **/
    const [form, setForm] = useState({
        text: comment.text || ''
    });
    const [isValidated, setValidated] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const handleChange = event => setForm({...form, text: event.target.value});
    const editComment = event => {

        event.preventDefault();

        const cur = event.currentTarget;
        if (cur.checkValidity() === false) {
            event.stopPropagation();
        }

        setValidated(true);

        // Form is valid
        if (cur.checkValidity() === true && form.text !== "") {
            // Set Spinner
            setLoading(true);

            const newComment = {
                text: form.text,
                id: comment.id,
                likes: comment.likes
            };


            firebase.updateComment(postId, comment, newComment)
                .then(() => {
                    setLoading(false);
                    setEditComment(false);
                })
                .catch(error => console.log("Error: " + error));
        }
    };
    /**
     *  Delete Comment
     */
    const deleteComment = () => {

        const newComment = {
            text: "",
            id: comment.id,
            likes: comment.likes
        };

        firebase.updateComment(postId, comment, newComment)
            .then(() => {
                setForm({text: ""});
            })
            .catch(error => console.log("Error: " + error));
    };

    // returns entire array of comments with increased comment likes
    const increaseCommentLikes = (comments, commentKey, userId) => {
        let commentCopy = [...comments];
        commentCopy[commentKey].likes.push(userId);
        return commentCopy;
    };
    // returns entire array of comments with decreased (by 1) comment likes
    const decreaseCommentLikes = (comments, commentKey, userId) => {
        let commentCopy = [...comments];
        commentCopy[commentKey].likes = commentCopy[commentKey].likes.filter(el => el !== userId);
        return commentCopy;
    };

    /**
     * Like / Dislike Comment
     */
    const handleCommentLoveButton = () => {
        if (!loveButtonActive) {
            // Update -> Add Like
            const newComments = increaseCommentLikes(allComments, commentKey, userId);
            firebase.updateCommentLikes(postId, newComments)
                .then(() => {
                    /** Send Notification to Commenter if comment is liked **/
                    if (user.id !== comment.id)
                        firebase.sendNotification({
                            id: user.id,
                            name: user.name,
                            picture: user.picture
                        }, comment.id, "likedComment", ROUTES.POSTS + '/' + postId)
                })
                .then(() => {
                    setLoveButtonActive(true);
                })
                .catch(error => console.log(error));
        } else {
            const newComments = decreaseCommentLikes(allComments, commentKey, userId);
            // Update -> Remove Like
            firebase.updateCommentLikes(postId, newComments)
                .then(() => {
                    setLoveButtonActive(false);
                })
                .catch(error => console.log(error));
        }
    };

    return (<div className="postComment">
        <ProfilePicSmall src={picture}/>
        <div className="postCommentInner">
            <div className="postProfile">
                <div className="postInfo">
                    <div className="postAuthor">
                        <Link to={ROUTES.USERS + "/" + id}>{name}</Link>
                    </div>
                </div>
            </div>
            <div className="postCommentLove">
                {form.text !== "" ? <LoveButton size={20} textSize={11} hearts={comment.likes.length}
                                                callback={handleCommentLoveButton}
                                                initialActive={loveButtonActive}/> : undefined}
            </div>
            <p>
                {editModeComment ?
                    <Form noValidate validated={isValidated} onSubmit={editComment}>
                        <Form.Row>
                            <Col lg={9}>
                                <Form.Control
                                    size="sm"
                                    as="textarea"
                                    type="textarea"
                                    name="text"
                                    required
                                    minLength="1"
                                    onChange={handleChange}>
                                    {comment.text}
                                </Form.Control>
                            </Col>
                            <Col lg={3}>
                                <Button type="submit" size="sm" block>
                                    {
                                        isLoading ?
                                            <Spinner animation="border" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </Spinner> : "Save"
                                    }
                                </Button>
                            </Col>
                        </Form.Row>


                    </Form> : form.text}
                {form.text === "" ?
                    <div className="deletedComment">
                        This comment was deleted.
                    </div> : undefined
                }</p>
            <div className="postCommentActions">
                {id === userId && form.text !== "" ?
                    <div className="postCommentDropdown">
                        {confirmDelete ? <ConfirmModal onConfirmed={deleteComment}
                                                       text="Are you sure you want to delete this comment?"/> : undefined}
                        <Dropdown>
                            <DropdownToggle id="postcomment-edit-delete" variant="link">
                                <UilCommentAltEdit size={14}/> Edit
                            </DropdownToggle>
                            <DropdownMenu alignRight>
                                <DropdownItem
                                    onClick={() => setEditComment(true)}
                                    disabled={editModeComment}>
                                    <UilEdit size={18}/> Edit
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => showConfirmDelete(true)}
                                    disabled={editModeComment || confirmDelete}
                                >
                                    <UilTimesCircle size={18}/> Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    : undefined}
            </div>
        </div>
    </div>);
};


export default PostComment;