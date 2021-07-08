import React, {useContext} from "react";
import {useRecoilValue} from "recoil/dist";
import sessionStore from "../../../recoil/sessionStore";
import FirebaseContext from "../../Firebase/context";
import CustomBands from "./CustomBands";
import {useQuery} from "react-query";

import _ from "lodash";

/**
 * Shows "random" bands that a user might want to follow. Similar to <PeopleYouMayKnow />
 */
const BandsYouMayLike = ({className}) => {
    const session = useRecoilValue(sessionStore);
    const firebase = useContext(FirebaseContext);

    const fetchRandomBands = (key) => {
        return new Promise((resolve, reject) => {
            const buffer = [];
            firebase.getNewestBands().then(
                snapshot => snapshot.forEach(
                    doc => {
                        if (doc) {
                            buffer.push({
                                id: doc.ref.id,
                                ...doc.data()
                            })
                        }
                    }
                )
            )
                .then(() => {
                    const after = buffer.filter(x => !x.members.includes(session.user.id));
                    resolve(after);
                })
                .catch(error => reject(error));
        });
    }

    const {data} = useQuery('randomBands', fetchRandomBands);

    return (
        !_.isEmpty(data) &&
        <>
            <CustomBands bands={data} heading="Bands you may like" className={className}/>
        </>
    );
};

export default BandsYouMayLike;