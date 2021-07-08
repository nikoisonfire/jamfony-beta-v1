import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/performance';
import {splitName} from "../../constants/timeHelpers";
import _ from "lodash";
import * as ROUTES from "../../constants/routes";

/**
 *  Basically the entire site backend.
 *  Connecting to firebase SDK, CRUD operations, etc.
 **/

/** Firebase Configuration stored in .env files **/
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FB_APIKEY,
    authDomain: process.env.REACT_APP_FB_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_FB_DBURL,
    projectId: process.env.REACT_APP_FB_PID,
    storageBucket: process.env.REACT_APP_FB_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_FB_SENDERID,
    appId: process.env.REACT_APP_FB_APPID,
    measurementId: process.env.REACT_APP_FB_MEASUREMENT_ID || ''
};

/**
 *  Main Firebase class (consumed by FirebaseContext)
 **/
class Firebase {
    constructor() {
        app.initializeApp(firebaseConfig);

        /** Initialize application scope **/
        this.auth = app.auth();
        this.db = app.database();
        this.firestore = app.firestore();
        this.storage = app.storage().ref();

        /** Auth Providers **/
        this.provider = new app.auth.GoogleAuthProvider();
        this.fbprovider = new app.auth.FacebookAuthProvider();
        this.fbprovider.addScope("email");

        // UNUSED
        this.actionCodeSettings = {
            url: ROUTES.ROOTDOMAIN + '/'
        };

        /** Off77line Persistence -> true **/
        this.firestore.enablePersistence()
            .catch(error => console.log(error.code));

        // All Containers using Paginated Queries are Flex box
        // -> set this to an even number for a non-ugly UI
        this.loadingLimit = 6;

        /** Recording Performance Metrics **/
        this.performance = app.performance();
    }

    // Auth API

    // Register new User with Email and Password
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password)
            .then(
                auth => auth.user.sendEmailVerification(this.actionCodeSettings)
                    .then(() => console.log("Verification Email sent"))
                    .catch(error => console.log(error)));

    // Login with Email and Password
    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    // Logout current user
    doSignOut = () => this.auth.signOut();

    // Login / Register with Google
    doGoogleSignIn = () => this.auth.signInWithPopup(this.provider);

    // Login / Register with Facebook
    doFBSignIn = () => this.auth.signInWithPopup(this.fbprovider);

    // Send Password Reset Email
    doPasswordReset = email => this.auth.sendPasswordResetEmail(email, this.actionCodeSettings);

    // UNUSED
    /*doEmailUpdate = (userId, newEmail) => {
        return this.auth.currentUser.updateEmail(newEmail)
            .then(
                () => this.firestore.collection("users").doc(userId).update({
                    email: newEmail
                }).catch(error => error)
            ).catch(error => error);
    };*/


    // Cloud Storage
    uploadProfilePicture = (filename, file) => {
        const picDest = this.storage.child("profilePictures/" + filename);
        return picDest.put(file);
    };
    // Upload Banners, Profile posts, etc.
    uploadAnyPicture = (filename, file) => {
        const picDest = this.storage.child(filename);
        return picDest.put(file);
    };

    /**
     *
     * Firestore Database
     * */

        // Helper Functions
    createTimestamp = (date) => app.firestore.Timestamp.fromDate(date);

    /**
     * ================
     * USER DB ACTIONS
     * ================
     * */

        // Create new User in Database (on /createprofile)
    createUserInDB = (userId, user) => {
        const {
            name,
            birthday,
            email,
            genres,
            instruments,
            location,
            occupations,
            picture
        } = user;

        const fullname = splitName(name);

        return this.firestore.collection("users").doc(userId).set({
            name: name,
            fullname: {
                firstName: fullname.firstName,
                lastName: fullname.lastName
            },
            birthday: (birthday.length === 10 ? this.createTimestamp(new Date(birthday)) : ''),
            email: email,
            genres: genres || [],
            location: location,
            occupations: occupations || [],
            instruments: instruments || [],
            picture: picture,
            joined: app.firestore.Timestamp.now(),
            following: [],
            friends: [],
            requests: [],
            bands: []
        }).then(() => this.firestore.collection("comments").doc(userId).set({comments: []}))
    };
    // Get a single user instance from Database (by id)
    getUserFromDB = (userId) => {
        return this.firestore.collection("users").doc(userId).get();
    };
    // Get the newest users
    getNewestUsers = () => {
        return this.firestore.collection("users")
            .orderBy("joined")
            .limit(this.loadingLimit)
            .get();
    };
    // Get users from a @location
    getLocalUsers = (location) => {
        return this.firestore.collection("users")
            .where("location", "==", location)
            .limit(this.loadingLimit)
            .get();
    };
    // Update a user instance by @userId with @data
    updateUser = (userId, data) => {
        return this.firestore.collection("users").doc(userId).update(data);
    };
    // Delete a user instance by @userId
    deleteUser = (userId) => {
        return this.firestore.collection("users").doc(userId).delete();
    };

    /**
     * ================
     * BANDS DB ACTIONS
     * ================
     */

        // Create a new band
    createBand = (data) => {
        return this.firestore.collection("bands").add({
            ...data,
            created: app.firestore.Timestamp.now()
        }).then(
            snapshot => {
                const buffer = {
                    id: snapshot.id,
                    picture: data.picture,
                    name: data.name
                };
                data.members.map(
                    el => this.firestore.collection("users")
                        .doc(el)
                        .update({
                            bands: app.firestore.FieldValue.arrayUnion(buffer)
                        })
                );
                return snapshot;
            }
        );
    };
    // Update Band instance
    updateBand = (bandId, data) => {
        return this.firestore.collection("bands").doc(bandId).update(data);
    };
    // Delete Band instance
    deleteBand = (bandId) => {
        return this.firestore.collection("bands").doc(bandId)
            .delete();
    };
    // Get a single band instance from DB by bandId
    getBandFromDB = (bandId) => {
        return this.firestore.collection("bands").doc(bandId).get();
    };
    // Get a bands members' userIds
    getBandMembers = (bandId) => {
        return this.firestore.collection("bands").doc(bandId).get()
            .then(doc => doc.data().members);
    };
    // Get a collection of newest bands
    getNewestBands = () => {
        return this.firestore.collection("bands")
            .orderBy("created")
            .limit(this.loadingLimit)
            .get();
    };
    // Get a collection of bands from @location
    getLocalBands = (location) => {
        return this.firestore.collection("bands")
            .where("location", "==", location)
            .limit(this.loadingLimit)
            .get();
    };
    // Get a collection of bands ordered by follower count
    getPopularBands = () => {
        return this.firestore.collection("bands")
            .orderBy("followerCount", "desc")
            .limit(this.loadingLimit)
            .get();
    };

    /**
     * ================
     * POST DB ACTIONS
     * ================
     * */

        // Create a new Post
    createPost = (postData) => {
        return this.firestore.collection("posts").add({
            ...postData,
            timestamp: app.firestore.Timestamp.now()
        });
    };
    // Get the newest (public feed) posts
    getNewestPosts = () => {
        // TODO: Set Limit!
        return this.firestore.collection("posts")
            .orderBy("timestamp", "desc")
            .limit(this.loadingLimit)
            .get();
    };
    // Get a users posts by their @userId
    getUserPosts = (userId) => {
        // TODO: Set Limit!
        return this.firestore.collection("posts")
            .where("user.id", "==", userId)
            .orderBy("timestamp", "desc")
            .limit(this.loadingLimit)
            .get();
    };
    // Get a single post by @postId (used as single page post)
    getSinglePost = (postId) => {
        return this.firestore.collection("posts").doc(postId).get();
    };
    // Update a posts "hearts" a.k.a. likes (add / remove)
    updatePostLikes = (postId, userId, remove) => {
        const ref = this.firestore.collection("posts").doc(postId);
        if (remove) {
            return this.firestore.runTransaction(transaction =>
                transaction.get(ref).then(doc => {
                    const likeCount = doc.data().likeCount - 1;

                    transaction.update(ref, {
                            likes: app.firestore.FieldValue.arrayRemove(userId),
                            likeCount: likeCount
                        }
                    );
                })
            ).catch(error => console.log(error))
        } else {
            return this.firestore.runTransaction(transaction =>
                transaction.get(ref).then(doc => {
                    const likeCount = doc.data().likeCount + 1;

                    transaction.update(ref, {
                            likes: app.firestore.FieldValue.arrayUnion(userId),
                            likeCount: likeCount
                        }
                    );
                })
            ).catch(error => console.log(error))
        }
    };
    // Update an edited post
    updatePost = (postId, data) => {
        const ref = this.firestore.collection("posts").doc(postId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                transaction.update(ref, data);
            })
        ).catch(error => console.log(error))
    };
    // Delete a post by @postId
    deletePost = (postId) => {
        return this.firestore.collection("posts").doc(postId).delete();
    };

    /**
     * ================
     * COMMENT DB ACTIONS
     * ================
     * */

        // Add a comment to a post by @postId. Uses a user (@commenter) instance as reference.
    addCommentToPost = (postId, comment, commenter) => {
        const ref = this.firestore.collection("posts").doc(postId);
        const refCom = this.firestore.collection("comments").doc(commenter.id);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                const newCount = doc.data().commentCount + 1;
                transaction.update(ref, {
                    comments: app.firestore.FieldValue.arrayUnion(comment),
                    commenters: app.firestore.FieldValue.arrayUnion(commenter),
                    commentCount: newCount
                })
                transaction.update(refCom, {
                    comments: app.firestore.FieldValue.arrayUnion(postId)
                })

            })
        );
    };
    // Update a comments likes
    updateCommentLikes = (postId, newComments) => {
        const ref = this.firestore.collection("posts").doc(postId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                transaction.update(ref, {
                    comments: newComments
                });
            })
        )
    };
    // Update a comment. Delete => "This comment has been deleted" as text
    updateComment = (postId, oldComment, newComment) => {
        const ref = this.firestore.collection("posts").doc(postId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                let buffer = _.cloneDeep(doc.data().comments)
                const index = buffer.findIndex(x => _.isEqual(x, oldComment))
                buffer[index] = newComment;
                transaction.update(ref, {
                    comments: buffer
                });
            })
        )
    };

    /**
     * ================
     * RELATIONSHIP DB ACTIONS
     * ================
     * */

        // Send a friend request @from (userId) @to (userId)
    sendFriendRequest = (from, to) => {
        const refFrom = this.firestore.collection("users").doc(from);
        const refTo = this.firestore.collection("users").doc(to);
        return this.firestore.runTransaction(transaction =>
            transaction.get(refTo).then(
                doc => {
                    transaction.update(refTo, {
                        requests: app.firestore.FieldValue.arrayUnion(from)
                    });
                    transaction.update(refFrom, {
                        requests: app.firestore.FieldValue.arrayUnion(to)
                    });
                }
            )
        );
    };
    // Accept a friend request @from (userId) @to (userId)
    acceptFriendRequest = (from, to) => {
        const refFrom = this.firestore.collection("users").doc(from);
        const refTo = this.firestore.collection("users").doc(to);
        return this.firestore.runTransaction(transaction =>
            transaction.get(refTo).then(
                doc => {
                    transaction.update(refTo, {
                        friends: app.firestore.FieldValue.arrayUnion(from),
                        requests: app.firestore.FieldValue.arrayRemove(from)
                    });
                    transaction.update(refFrom, {
                        friends: app.firestore.FieldValue.arrayUnion(to),
                        requests: app.firestore.FieldValue.arrayRemove(to)
                    });
                }
            )
        );
    };
    // Deny a friend request @from (userId) @to (userId)
    // Denied friend requests are just deleted from the DB, so technially a user can send unlimited requests.
    denyFriendRequest = (from, to) => {
        const refFrom = this.firestore.collection("users").doc(from);
        const refTo = this.firestore.collection("users").doc(to);
        return this.firestore.runTransaction(transaction =>
            transaction.get(refTo).then(
                doc => {
                    transaction.update(refTo, {
                        requests: app.firestore.FieldValue.arrayRemove(from)
                    });
                    transaction.update(refFrom, {
                        requests: app.firestore.FieldValue.arrayRemove(to)
                    });
                }
            )
        );
    };
    // Remove a friend from profile.
    removeFriend = (from, to) => {
        return this.firestore.collection("users")
            .doc(from)
            .update({
                friends: app.firestore.FieldValue.arrayRemove(to)
            })
            .then(() => {
                this.firestore.collection("users").doc(to).update({
                    friends: app.firestore.FieldValue.arrayRemove(from)
                })
            });
    };
    // "Follow" a band by @bandId. This has no real functionality yet, other than user can be invited to events.
    followBand = (userId, bandId) => {
        const refUser = this.firestore.collection("users").doc(userId);
        const refBand = this.firestore.collection("bands").doc(bandId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(refBand).then(doc => {
                transaction.update(refBand, {
                    followers: app.firestore.FieldValue.arrayUnion(userId),
                    followerCount: app.firestore.FieldValue.increment(1)
                });
                transaction.update(refUser, {
                    following: app.firestore.FieldValue.arrayUnion(bandId)
                });
            })
        );
    };
    // Unfollow a band by @bandId.
    unfollowBand = (userId, bandId) => {
        const refUser = this.firestore.collection("users").doc(userId);
        const refBand = this.firestore.collection("bands").doc(bandId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(refBand).then(doc => {
                transaction.update(refBand, {
                    followers: app.firestore.FieldValue.arrayRemove(userId),
                    followerCount: app.firestore.FieldValue.increment(-1)
                });
                transaction.update(refUser, {
                    following: app.firestore.FieldValue.arrayRemove(bandId)
                });
            })
        );
    };

    /**
     * ================
     * EVENT DB ACTIONS
     * ================
     * */

        // Create a new Event
    createEvent = (data) => {
        return this.firestore.collection("events").add({
            ...data,
            startTime: this.createTimestamp(new Date(data.startDate + 'T' + data.startTime)),
            attending: [],
            created: app.firestore.Timestamp.now()
        });

    };
    // Edit an Event
    editEvent = (eventId, data) => {
        return this.firestore.collection("events").doc(eventId).update({
            ...data,
            startTime: this.createTimestamp(new Date(data.startDate + 'T' + data.startTime)),
        });
    };
    // Delete an Event.
    deleteEvent = (eventId) => {
        return this.firestore.collection("events").doc(eventId).delete();
    };
    // Get a single Event instance by @eventId
    getEvent = (eventId) => {
        return this.firestore.collection("events").doc(eventId).get();
    };
    // Get all events by a certain band (@bandId)
    getEventsByBand = (bandId) => {
        return this.firestore.collection("events")
            .where("hostType", "==", "band")
            .where("host.id", "==", bandId)
            .orderBy("startTime", "desc")
            .get();
    };
    // Get all events by a certain user (@userId)
    getEventsByUser = (userId) => {
        return this.firestore.collection("events")
            .where("hostType", "==", "user")
            .where("host.id", "==", userId)
            .get();
    }
    // Get Events in a certain @location
    getLocalEvents = (location) => {
        return this.firestore.collection("events")
            .where("location", "==", location)
            .limit(this.loadingLimit)
            .get();
    };
    // Get Events ordered by how soon they are going to happen (most recent Events first)
    getSoonEvents = () => {
        return this.firestore.collection("events")
            .orderBy("startTime", "asc")
            .limit(this.loadingLimit)
            .get();
    };
    // Get newly created events.
    getNewestEvents = () => {
        return this.firestore.collection("events")
            .orderBy("created", "desc")
            .limit(this.loadingLimit)
            .get();
    };
    // Attend an Event as a User
    attendEvent = (eventId, userId) => {
        const ref = this.firestore.collection("events").doc(eventId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                transaction.update(ref, {
                        attending: app.firestore.FieldValue.arrayUnion(userId)
                    }
                );
            })
        )
    };
    // Remove Attendance from Event ("un-attend")
    unattendEvent = (eventId, userId) => {
        const ref = this.firestore.collection("events").doc(eventId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                transaction.update(ref, {
                        attending: app.firestore.FieldValue.arrayRemove(userId)
                    }
                );
            })
        )
    };
    // Invite a user to an Event and send them a notification about it.
    inviteUser = (eventId, userId, fromUser) => {
        const ref = this.firestore.collection("events").doc(eventId);
        return this.firestore.runTransaction(transaction =>
            transaction.get(ref).then(doc => {
                transaction.update(ref, {
                        invited: app.firestore.FieldValue.arrayUnion(userId)
                    }
                );
            })
        ).then(
            () => this.sendNotification(fromUser, userId, "inviteEvent", ROUTES.EVENTS + '/' + eventId)
        )
        //
    };


    /**
     *  Realtime Database for Notifications / Messages
     */

    /** NOTIFICATIONS **/

        // Get a users notifications ONCE.
    getNotifications = (userId, bands) => {
        const path = 'notifications/' + userId;
        return this.db.ref(path).limitToLast(6)
            .once('value')
    };
    // Listen to the 'notificationsCount/{@userId}' thread.
    listenToNotificationCount = (userId, callback) => {
        const path = 'notificationsCount/' + userId;
        return this.db.ref(path).on('value',
            snapshot =>
                callback(snapshot.val()),
            error =>
                console.log(error)
        );
    };
    // Reset a users (@userId) notifications in the 'notificationsCount/{@userId}' thread.
    resetNotificationCount = (userId) => {
        const path = 'notificationsCount/' + userId;
        return this.db.ref(path).set({
            unreadCount: 0
        });
    };
    // Stop listening to the 'notificationsCount/{@userId}' thread.
    unlistenToNotificationCount = (userId) => {
        const path = 'notificationCount/' + userId;
        return this.db.ref(path)
            .off();
    };
    // Send a single notifications @fromUser (object) to @toUser (only id)
    // with an @action (defined in /constants/options.js and an onClick @redirect
    sendNotification = (fromUser, toUser, action, redirect) => {
        if (fromUser.id !== toUser) {
            const path = 'notifications/' + toUser;
            const newNotificationRef = this.db.ref(path).push();
            return newNotificationRef.set({
                id: fromUser.id,
                name: fromUser.name,
                picture: fromUser.picture,
                action: action,
                redirect: redirect,
                created: app.firestore.Timestamp.now()
            });
        }
        return Promise.resolve();
    };
    // Remove a single notification from 'notifications/{@userId}' by notification key
    removeNotification = (userId, key) => {
        const path = 'notifications/' + userId;
        return this.db.ref(path).child(key).remove();
    };

    /** MESSAGE THREADS **/
        // Get a unique message thread ID by string comparison
    getThreadID = (user1, user2) => user1 < user2 ? user1 + user2 : user2 + user1;
    // Listen to a single conversation between two users (@userId <> @messagedUserId)
    getMessages = (userId, messagedUserId, callback) => {
        const path = 'messages/' + this.getThreadID(userId, messagedUserId);
        return this.db.ref(path)
            .on('value',
                snapshot => {
                    if (snapshot.exists()) {
                        callback(snapshot.val())
                    }
                },
                error =>
                    console.log(error));
    }
    // Stop listening to a single conversation
    detachMessageListener = (userId, messagedUserId) => {
        const path = 'messages/' + this.getThreadID(userId, messagedUserId);
        return this.db.ref(path)
            .off();
    }
    // Send a message @fromUser (id) to @toUser (id) with @message text
    sendMessage = (fromUser, toUser, message) => {
        const threadID = this.getThreadID(fromUser, toUser)
        const pathMessages = 'messages/' + threadID;

        const newMsgRef = this.db.ref(pathMessages).push();

        return newMsgRef.set({
            from: fromUser,
            text: message,
            read: false,
            created: app.firestore.Timestamp.now()
        });
    }

    /** MESSAGES **/

        // Create a conversation thread between two users. Used mostly to view profile info and unread messages count.
    createMessageThread = (user1, user2) => {
        const path1 = this.db.ref('chats/' + user1.id + '/' + user2.id);
        const path2 = this.db.ref('chats/' + user2.id + '/' + user1.id);

        return path1.set({
            id: user2.id,
            name: user2.name,
            picture: user2.picture
        }).then(
            () => path2.set({
                id: user1.id,
                name: user1.name,
                picture: user1.picture
            })
        );
    }
    // Listen to all conversation threads by a @userId.
    listenToThreads = (userId, callback) => {
        const pathThreads = 'chats/' + userId;

        return this.db.ref(pathThreads)
            .on('value', snapshot => {
                if (snapshot.exists()) callback(snapshot.val())
            }, error => console.log(error))
    }
    // Stop listening to all conversation threads by a @userId.
    unlistenToThreads = (userId) => {
        const pathThreads = 'chats/' + userId;

        return this.db.ref(pathThreads)
            .off();
    }
    // Mark messages from @fromUser as read -> reset unreadCount in thread between @userId and @fromUser
    readMessages = (userId, fromUser) => {
        const pathUnread = 'chats/' + userId + '/' + fromUser;
        return this.db.ref(pathUnread).update({
            unreadCount: 0
        });
    }
}

export default Firebase;