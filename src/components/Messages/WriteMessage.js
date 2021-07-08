import React, {useState} from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

/**
 * Form Component for composing Chat messages.
 */
const WriteMessage = (props) => {
    const [message, setMessage] = useState("");

    const sendMessage = event => {
        event.preventDefault();

        if (message !== "") {
            props.callback(message);
            setMessage("");
        }
    }

    return (
        <div className={"writeMessage"}>
            <Form onSubmit={sendMessage} autoComplete={"off"}>
                <Form.Row>
                    <Col lg={10}>
                        <Form.Control
                            type={"text"}
                            as={"input"}
                            name={"message"}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </Col>
                    <Col lg={2}>
                        <Button type={"submit"} size={"sm"}>
                            Send
                        </Button>
                    </Col>
                </Form.Row>
            </Form>
        </div>
    );
};

export default WriteMessage;