import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

/**
 *   Form to add comment to a post.
 **/
const AddComment = props => {

    const [text, setText] = useState({});
    const [isValidated, setValidated] = useState(false);

    const handleChange = event => setText(event.target.value);

    const submitComment = event => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        }

        setValidated(true);

        // Form is valid
        if (form.checkValidity() === true && text !== "") {
            props.callback(text);
        }
    };

    return (
        <Form noValidate validated={isValidated} onSubmit={submitComment}>
            <Form.Group controlId="newPostText">
                <Form.Label srOnly>Create a text Post</Form.Label>
                <Form.Control
                    size="sm"
                    as="textarea"
                    type="textarea"
                    name="postText"
                    required
                    minLength="1"
                    onChange={handleChange}
                    placeholder="Be nice and respectful"/>
                <Form.Control.Feedback type="invalid">
                    Please check again.
                </Form.Control.Feedback>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" size="sm">
                Comment
            </Button>
        </Form>
    )
};

export default AddComment;