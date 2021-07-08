import algoliasearch from 'algoliasearch/lite';
import {connectAutoComplete, InstantSearch} from 'react-instantsearch-dom';
import React, {useEffect, useState} from "react";
import ProfilePicSmall from "../Widgets/ProfilePicSmall";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";

const searchClient = algoliasearch(process.env.REACT_APP_ALGOLIA_APPID, process.env.REACT_APP_ALGOLIA_APIKEY);

/**
 *  Algolia-powered component to search for members when creating / editing a band.
 */
const SearchBandMembers = props => {
    return (
        <InstantSearch
            searchClient={searchClient}
            indexName={process.env.REACT_APP_ALGOLIA_INDEX_USERS}
        >
            <AutoComplete callback={(hit) => {
                props.callback(hit);
            }}/>
        </InstantSearch>
    );
};

/**
 *  Form Component. Wrapped by Algolia HOC "connectAutoComplete".
 */
const AutoCompleteForm = ({hits, currentRefinement, refine, callback}) => {
    const [val, setVal] = useState("");

    useEffect(() => {
        const timeOut = setTimeout(() => {
            refine(val)
        }, 500);
        return () => {
            clearTimeout(timeOut);
        };
    }, [val]);


    return (
        <ul className="bandAC">
            <li className="bandACInput">
                <FormControl
                    type="search"
                    onChange={event => setVal(event.target.value)}
                    placeholder={"Search for members"}
                />
            </li>
            {currentRefinement.length > 0 ?
                hits.map(
                    hit => (
                        <li key={hit.objectID} className="bandACResult">
                            <div className="miniProfileHorizontal">
                                <ProfilePicSmall src={hit.picture}/>
                                <span className="name">{hit.name}</span>
                            </div>
                            <Button variant="secondary" size={"sm"} onClick={() => {
                                const anyInstrument = hit.instruments[0];
                                const member = {
                                    id: hit.objectID,
                                    name: hit.name,
                                    picture: hit.picture,
                                    instruments: []
                                };
                                callback(member);
                                refine("");
                            }}>
                                Add Member
                            </Button>
                        </li>
                    )
                ) : null}
        </ul>

    );
};

const AutoComplete = connectAutoComplete(AutoCompleteForm);

export default SearchBandMembers;