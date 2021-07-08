import React, {useContext} from "react";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../../recoil/sessionStore";
import FirebaseContext from "../../Firebase/context";
import {useQuery} from "react-query";

import _ from "lodash";
import UserSnippet from "../Snippets/UserSnippet";

/**
 *  People you may know - Widget based on newest users.
 *  TODO: make this smarter
 */
const PeopleYouMayKnow = ({className}) => {
    const session = useRecoilValue(sessionStore);
    const firebase = useContext(FirebaseContext);

    const getNewestUsers = (key, all) => {
        return new Promise((resolve, reject) => {
            firebase.getNewestUsers().then(
                snapshot => {
                    let users = [];
                    snapshot.forEach(
                        doc => users.push({...doc.data(), id: doc.id})
                    );
                    return resolve(users.filter(x => x.id !== session.user.id));
                }
            ).catch(
                error => reject(error)
            );
        });
    };

    const {data} = useQuery(["users", "newest"], getNewestUsers);

    return (
        !_.isEmpty(data) &&
        <>
            <UserSnippet className={className} users={data} heading="People you may know"/>
        </>
    );
};

export default PeopleYouMayKnow;