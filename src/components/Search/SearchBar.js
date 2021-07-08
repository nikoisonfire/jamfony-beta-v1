import React, {useEffect, useState} from "react";
import algoliasearch from 'algoliasearch/lite';
import {Configure, connectSearchBox, Hits, Index, InstantSearch} from 'react-instantsearch-dom';
import defaultPic from "../../images/defaultProfile.png";
import Image from "react-bootstrap/Image";
import FormControl from "react-bootstrap/FormControl";
import {useHistory} from "react-router-dom";
import * as ROUTES from "../../constants/routes";


const searchClient = algoliasearch(process.env.REACT_APP_ALGOLIA_APPID, process.env.REACT_APP_ALGOLIA_APIKEY);

/**
 *  Main Search Bar to search Users, Bands and Events - embedded in Navigation
 */
const SearchBar = props => {
    const [show, setShow] = useState("hide");
    return (
        <div className={"search"}>
            <InstantSearch indexName={process.env.REACT_APP_ALGOLIA_INDEX_USERS} searchClient={searchClient}>
                <Configure hitsPerPage={3}/>
                <CustomSearchBox className={"mainSearchBar"} callback={() => setShow(oldVal => {
                    if (oldVal === "hide") {
                        // Scroll div to top on show
                        const objDiv = document.getElementById("results");
                        objDiv.scrollTop = 0;
                        return ""
                    } else {
                        return "hide";
                    }
                })}/>

                <div className={"results " + show} id={"results"}>
                    <Index indexName={process.env.REACT_APP_ALGOLIA_INDEX_USERS}>
                        <span className={"title"}>Users</span>
                        <Hits minHitsPerPage={6} hitComponent={Hit}/>
                    </Index>

                    <Index indexName={process.env.REACT_APP_ALGOLIA_INDEX_EVENTS}>
                        <span className={"title"}>Events</span>
                        <Hits minHitsPerPage={6} hitComponent={Hit}/>
                    </Index>

                    <Index indexName={process.env.REACT_APP_ALGOLIA_INDEX_BANDS}>
                        <span className={"title"}>Bands</span>
                        <Hits minHitsPerPage={6} hitComponent={Hit}/>
                    </Index>
                </div>
            </InstantSearch>
        </div>
    );
};

/**
 *  Single Hit Component in Search
 */
const Hit = ({hit}) => {
    const correctRoute = hit.startTime ? ROUTES.EVENTS : hit.members ? ROUTES.BANDS : ROUTES.USERS;
    const history = useHistory();

    return (
        <div className={"searchHit"} onClick={() => history.push(correctRoute + '/' + hit.objectID)}>
            <Image roundedCircle width={30} height={30} src={hit.picture || hit.banner || defaultPic}/>
            <span className={"name"}>
                {hit.name}
            </span>
        </div>
    );
}

/**
 *  Search Input
 */
const SearchBox = ({hits, currentRefinement, refine, callback}) => {
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
        <FormControl
            onFocus={callback}
            onBlur={() => setTimeout(callback, 100)}
            type="search"
            value={val}
            onChange={event => setVal(event.target.value)}
            placeholder={"Search for members"}
        />
    );
};

/**
 * Connect to Algolia Search Box
 */
const CustomSearchBox = connectSearchBox(SearchBox);

export default SearchBar;