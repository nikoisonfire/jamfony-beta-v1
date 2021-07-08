import UilUserPlus from "@iconscout/react-unicons/icons/uil-user-plus";
import React from "react";
import UilGrin from "@iconscout/react-unicons/icons/uil-grin";
import UilFrown from "@iconscout/react-unicons/icons/uil-frown";
import UilMegaphone from "@iconscout/react-unicons/icons/uil-megaphone";
import UilCommentHeart from "@iconscout/react-unicons/icons/uil-comment-heart";
import UilCommentLines from "@iconscout/react-unicons/icons/uil-comment-lines";
import UilHeart from "@iconscout/react-unicons/icons/uil-heart";
import UilFilePlus from "@iconscout/react-unicons/icons/uil-file-plus";
import UilCalendarAlt from "@iconscout/react-unicons/icons/uil-calendar-alt";
import UilEnvelopeAdd from "@iconscout/react-unicons/icons/uil-envelope-add";
import UilUsersAlt from "@iconscout/react-unicons/icons/uil-users-alt";

/**
 * Site-wide options configuration
 */
const options = {
    "occupation": [
        {value: 'singer', label: 'Singer'},
        {value: 'player', label: 'Instrument Player'},
        {value: 'songwriter', label: 'Songwriter'},
        {value: 'producer', label: 'Producer'},
        {value: 'dj', label: 'DJ'},
        {value: 'composer', label: 'Composer'},
        {value: 'teacher', label: 'Teacher'},
        {value: 'promoter', label: 'Promoter/Business'}
    ],
    "instruments": [
        {value: 'vocals', label: 'Vocals'},
        {value: 'guitar', label: 'Guitar'},
        {value: 'bass', label: 'Bass'},
        {value: 'piano', label: 'Piano'},
        {value: 'drums', label: 'Drums'},
        {value: 'keys', label: 'Keys'},
        {value: 'synths', label: 'Synths'},
        {value: 'strings', label: 'Strings'},
        {value: 'woodwinds', label: 'Woodwinds'},
        {value: 'brass', label: 'Brass'},
        {value: 'ukulele', label: 'Ukulele'},
        {value: 'percussion', label: 'Percussion'},
        {value: 'turntables', label: 'Turntables (DJ)'},
        {value: 'accordion', label: 'Accordion'}
    ],
    "genres": [
        {value: 'pop', label: 'Pop'},
        {value: 'indie', label: 'Indie'},
        {value: 'alternative', label: 'Alternative'},
        {value: 'rock', label: 'Rock'},
        {value: 'indierock', label: 'Indie Rock'},
        {value: 'heavymetal', label: 'Heavy Metal'},
        {value: 'punk', label: 'Punk Rock'},
        {value: 'hiphop', label: 'Hip-hop'},
        {value: 'rap', label: 'Rap'},
        {value: 'blues', label: 'Blues'},
        {value: 'jazz', label: 'Jazz'},
        {value: 'country', label: 'Country'},
        {value: 'world', label: 'World music'},
        {value: 'classical', label: 'Classical'},
        {value: 'electronic', label: 'Electronic music'},
        {value: 'ambient', label: 'Ambient'},
        {value: 'techno', label: 'Techno'},
        {value: 'edm', label: 'EDM'},
        {value: 'house', label: 'House'},
        {value: 'dance', label: 'Dance'},
        {value: 'latin', label: 'Latin'},
        {value: 'reggae', label: 'Reggae'},
        {value: 'experimental', label: 'Experimental'},
        {value: 'psychedelic', label: 'Psychedelic'},
        {value: 'folk', label: 'Folk'},
        {value: 'soul', label: 'R&B Soul'},
        {value: 'funk', label: 'Funk'}
    ],
    // Types of events
    "eventTypes": [
        {value: 'concert', label: 'Concert'},
        {value: 'openstage', label: 'Open Stage/Open Mic'},
        {value: 'jamsession', label: 'Jamsession'},
        {value: 'festival', label: 'Festival'},
        {value: 'masterclass', label: 'Masterclass'}
    ],
    // @Actions for Notifications (used in firebase.js)
    "notificationActions": [
        {action: "postedEvent", text: "announced a new event", icon: <UilCalendarAlt/>},
        {action: "inviteEvent", text: "invited you to an event", icon: <UilEnvelopeAdd/>},
        {action: "attendingEvent", text: "is attending your event", icon: <UilUsersAlt/>},
        {action: "postedPost", text: "posted a new post", icon: <UilFilePlus/>},
        {action: "likedPost", text: "liked your post", icon: <UilHeart/>},
        {action: "likedComment", text: "liked your comment", icon: <UilCommentHeart/>},
        {action: "commentedPost", text: "also commented this post", icon: <UilCommentLines/>},
        {action: "commentedMyPost", text: "commented on your post", icon: <UilCommentLines/>},
        {action: "addFriend", text: "added you as a friend", icon: <UilUserPlus/>},
        {action: "acceptedFriend", text: "accepted your friend request", icon: <UilGrin/>},
        {action: "deniedFriend", text: "denied your friend request", icon: <UilFrown/>},
        {action: "followedBand", text: "follows your band", icon: <UilMegaphone/>}
    ]
};

export default options;