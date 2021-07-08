import React, {useState} from "react";
import UilGlobe from "@iconscout/react-unicons/icons/uil-globe";

import icon_sc from "../../../images/icons/soundcloud.png";
import icon_yt from "../../../images/icons/youtube.png";
import icon_applem from "../../../images/icons/apple.png";
import icon_spotify from "../../../images/icons/spotify.png";
import icon_bc from "../../../images/icons/bandcamp.png";
import UilLinkAdd from "@iconscout/react-unicons/icons/uil-link-add";
import AddSocialLink from "../../Modals/AddSocialLink";

/**
 *  Social Media - Link Widget for User and Band Profiles.
 */
const LinkSnippet = ({applemusic, bandcamp, className, id, isPrivate, isUser, soundcloud, spotify, web, youtube}) => {
    const [showSocialLink, setSocialLink] = useState(false);


    return (
        <div className={"linkSnippet " + className}>
            {showSocialLink ?
                <AddSocialLink
                    isUser={isUser}
                    id={id}
                    callback={() => setSocialLink(false)}
                /> : null}
            <ul>
                {
                    web ?
                        <li>
                            <a href={web} target="_blank" alt="" rel="noopener noreferrer" title="Website">
                                <UilGlobe/>
                                Website
                            </a>
                        </li> : null
                }
                {
                    soundcloud ?
                        <li>
                            <a href={soundcloud} target="_blank" alt="" rel="noopener noreferrer"
                               title="SoundCloud Profile">
                                <img src={icon_sc}/>
                                SoundCloud
                            </a>
                        </li> : null
                }
                {
                    spotify ?
                        <li>
                            <a href={spotify} target="_blank" alt="" rel="noopener noreferrer" title="Spotify Profile">
                                <img src={icon_spotify}/>
                                Spotify
                            </a>
                        </li> : null
                }
                {
                    youtube ?
                        <li>
                            <a href={youtube} target="_blank" alt="" rel="noopener noreferrer" title="YouTube Profile">
                                <img src={icon_yt}/>
                                YouTube
                            </a>
                        </li> : null
                }
                {
                    applemusic ?
                        <li>
                            <a href={applemusic} target="_blank" alt="" rel="noopener noreferrer"
                               title="Apple Music Profile">
                                <img src={icon_applem}/>
                                Apple Music
                            </a>
                        </li> : null
                }
                {
                    bandcamp ?
                        <li>
                            <a href={bandcamp} target="_blank" alt="" rel="noopener noreferrer"
                               title="Bandcamp Profile">
                                <img src={icon_bc}/>
                                Bandcamp
                            </a>
                        </li> : null
                }
                {
                    isPrivate ?
                        <li>
                            <a onClick={() => setSocialLink(true)}>
                                <UilLinkAdd/>
                                Add Social Link / Profile
                            </a>
                        </li> : null
                }
            </ul>
        </div>
    )
};

export default LinkSnippet;