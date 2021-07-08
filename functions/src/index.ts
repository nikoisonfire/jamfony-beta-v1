import * as functions from "firebase-functions";
import {tmpdir} from "os";
import {dirname, join} from "path";

import * as sharp from "sharp";
import * as fs from "fs-extra";
import * as _ from "lodash";
import * as algoliasearch from "algoliasearch";

const path = require('path');

/**
 * Initiate all the firebase admin stuff to access features from here.
 */
const admin = require("firebase-admin");
admin.initializeApp(functions.firebaseConfig());
// Firestore
const db = admin.firestore();
// Realtime Database
const rt = admin.database();


/**
 * Random helper functions
 */
const rimraf = require("rimraf");
const {v4: uuidv4} = require('uuid');

/**
 * Initiate Algoliasearch client and initiate user index
 * **/
// @ts-ignore
const client = algoliasearch("72FCCR987Y", "09e65678ebb28be4a79767b5dc1cacce");
const indexU = client.initIndex('dev_USERS');
const indexB = client.initIndex('dev_BANDS');
const indexE = client.initIndex('dev_EVENTS');

/**
 * ==== STORAGE ====
 * Generates Thumbnails from Pictures uploaded to Storage.
 * @cc to firebase docs for the boilerplate
 */
export const generateThumbs = functions
    .region('europe-west1')
    .storage
    .object()
    .onFinalize(async object => {
        const bucket = admin.storage().bucket(object.bucket);
        const filePath = object.name;
        const fileName = path.basename(filePath);

        if (fileName.startsWith('thumb@') || !object.contentType.startsWith('image/')) {
            console.log('exiting function');
            return false;
        }

        if (filePath.includes("profilePictures")) {
            const bucketDir = dirname(filePath);

            const workingDir = join(tmpdir() + '/' + uuidv4(), 'thumbs');
            const tmpFilePath = join(workingDir, 'source.png');
            console.log("tmpFilePath: " + tmpFilePath);


            // 1. Ensure thumbnail dir exists
            await fs.ensureDir(workingDir);

            // 2. Download Source File
            await bucket.file(filePath).download({
                destination: tmpFilePath
            });


            // 3. Resize the images and define an array of upload promises
            const sizes = [200];
            const thumbName = `thumb@200_${fileName}`;
            const thumbPath = join(workingDir, thumbName);

            const uploadPromises = sizes.map(async size => {
                // Resize source image
                await sharp(tmpFilePath)
                    .resize(size, size)
                    .toFile(thumbPath);

                const ctype = fileName.includes("png") ? "image/png" : "image/jpeg";
                const meta = {
                    contentType: ctype
                };
                // Upload to GCS
                return bucket.upload(thumbPath, {
                    destination: join(bucketDir, thumbName),
                    metadata: meta
                });
            });

            // 4. Run the upload operations
            await Promise.all(uploadPromises);

            if (!fileName.startsWith('thumb@')) {
                console.log("Deleting original file");
                bucket.file(filePath).delete();
            }

            // 5. Cleanup remove the tmp/thumbs from the filesystem
            return rimraf(workingDir);
        }
    });

/**
 * ==== FIRESTORE ====
 * Cleans up user documents when a band doc is deleted.
 */
export const deleteBandsCleanup = functions
    .region('europe-west1')
    .firestore
    .document('bands/{bandId}')
    .onDelete((change, context) => {
        const data = change.data();

        return new Promise((resolve, reject) => {
            // Mocking the element that is saved in posts and user profiles
            const remEl = {
                id: context.params.bandId,
                name: data.name,
                picture: data.picture
            };

            // Update the band members user profiles
            data.members.map(
                user =>
                    db.collection("users").doc(user).update({
                        bands: admin.firestore.FieldValue.arrayRemove(remEl)
                    }).catch(error => reject(error))
            );
            // Delete all the bands posts upon deletion, but first get their ids
            db.collection("posts")
                .where("user.id", "==", context.params.bandId)
                .get()
                .then(snapshot =>
                    snapshot.forEach(
                        doc => {
                            if (doc) {
                                // finally delete the posts
                                db.collection("posts")
                                    .doc(doc.ref.id)
                                    .delete()
                                    .catch(error => reject(error));
                            }
                        }
                    )
                ).catch(error => reject(error))
            resolve(true);
        });
    });

/**
 * ==== FIRESTORE ====
 * Updates band member profiles and also the bands posts when a band is edited
 */
export const editBandsUserUpdate = functions
    .region('europe-west1')
    .firestore
    .document('bands/{bandId}')
    .onUpdate((change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        const beforeMembersSorted = (_.cloneDeep(before.members)).sort();
        const afterMembersSorted = (_.cloneDeep(after.members)).sort();
        const removedUsers = _.difference(beforeMembersSorted, afterMembersSorted);
        console.log(removedUsers);

        return new Promise((resolve, reject) => {
            // Mocking the element that is saved in posts and user profiles
            const remEl = {
                id: context.params.bandId,
                name: before.name,
                picture: before.picture
            };
            const addEl = {
                id: context.params.bandId,
                name: after.name,
                picture: after.picture
            };

            // Update the band members user profiles
            after.members.map(
                user =>
                    db.collection("users").doc(user).update({
                        bands: admin.firestore.FieldValue.arrayRemove(remEl)
                    }).then(() =>
                        db.collection("users").doc(user).update({
                            bands: admin.firestore.FieldValue.arrayUnion(addEl)
                        })
                    )
                        .catch(error => reject(error))
            );

            // Delete data from removed band members
            if (removedUsers?.length > 0) {
                removedUsers.forEach(
                    removedUser =>
                        db.collection("users").doc(removedUser).update({
                            bands: admin.firestore.FieldValue.arrayRemove(remEl)
                        }).catch(error => reject(error))
                );
            }

            db.collection("posts")
                .where("user.id", "==", context.params.bandId)
                .get()
                .then(snapshot =>
                    snapshot.forEach(
                        doc => {
                            if (doc) {
                                // finally delete the posts
                                db.collection("posts")
                                    .doc(doc.ref.id)
                                    .update({
                                        user: addEl
                                    })
                                    .catch(error => reject(error));
                            }
                        }
                    )
                ).catch(error => reject(error))

            db.collection("events")
                .where("hostType", "==", "band")
                .where("host.id", "==", context.params.bandId)
                .get()
                .then(snapshot =>
                    snapshot.forEach(
                        doc => {
                            if (doc) {
                                // finally delete the posts
                                db.collection("events")
                                    .doc(doc.ref.id)
                                    .update({
                                        host: addEl
                                    })
                                    .catch(error => reject(error));
                            }
                        }
                    )
                ).catch(error => reject(error))

            resolve(true);
        });
    });

/**
 * ==== FIRESTORE ====
 * Cleans up "comments" documents when a post is deleted.
 */
export const deletePostsCleanup = functions
    .region('europe-west1')
    .firestore
    .document('posts/{postId}')
    .onDelete((change, context) => {
        const data = change.data();

        return new Promise((resolve, reject) => {
            // Get 'comments/{userId}' docs to update by checking for post commenters uid's
            data.commenters?.map(
                commenter =>
                    db.collection("comments").doc(commenter.id).update({
                        comments: admin.firestore.FieldValue.arrayRemove(context.params.postId)
                    }).catch(error => reject(error))
            );
            resolve(true);
        });
    });

/**
 * ==== FIRESTORE ====
 * Clean up, when a user is deleted - deletes Posts and Comments made by the User
 */
export const deleteUsersCleanup = functions
    .region('europe-west1')
    .firestore
    .document('users/{userId}')
    .onDelete((change, context) => {
        const data = change.data();
        const oldUser = {
            id: context.params.userId,
            name: data.name,
            picture: data.picture
        };

        return new Promise((resolve, reject) => {
            // Delete all posts by the user
            db.collection("posts")
                .where("user.id", "==", context.params.userId)
                .get()
                .then(snapshot =>
                    snapshot.forEach(
                        doc => doc.ref.delete().catch(error => reject(error))
                    )
                )
                .then(
                    // Delete user comments
                    db.collection("comments").doc(context.params.userId).get().then(res => {
                        if (res) {
                            const commentsPosted = res.data().comments;
                            if (commentsPosted.length > 0) {
                                commentsPosted.map(
                                    el => {
                                        db.collection("posts")
                                            .doc(el)
                                            .get()
                                            .then(doc => {
                                                if (doc) {
                                                    const post = doc.data();
                                                    if (post.comments.length > 0) {
                                                        const filteredComments = post.comments.filter(
                                                            x => x.id !== context.params.userId
                                                        );
                                                        console.log(filteredComments);
                                                        db.collection("posts")
                                                            .doc(el)
                                                            .update({
                                                                commenters: admin.firestore.FieldValue.arrayRemove(oldUser),
                                                                comments: filteredComments
                                                            })
                                                            .catch(error => reject(error))
                                                    }
                                                }
                                            })
                                            .catch(error => reject(error))
                                    }
                                )
                            }
                        }
                    })
                )
                .then(() =>
                    // Delete the comment-references in the 'comments' collection
                    db.collection("comments")
                        .doc(context.params.userId)
                        .delete()
                        .catch(error => reject(error))
                )
                .catch(error => reject(error))
        });
    });

/**
 * ==== FIRESTORE ====
 * Change user name and picture when a 'user' document is changed
 * Changes users own posts.
 */
export const editProfilePosts = functions
    .region('europe-west1')
    .firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = change.after.data();

        // ...or the previous value before this update
        const previousValue = change.before.data();

        const oldUser = {
            name: previousValue.name,
            picture: previousValue.picture,
            id: context.params.userId
        };
        const newUser = {
            name: newValue.name,
            picture: newValue.picture,
            id: context.params.userId
        };

        // Compare the two objects, if there is any change in name, picture
        if (JSON.stringify(oldUser) !== JSON.stringify(newUser)) {
            return new Promise((resolve, reject) => {
                db.collection("posts")
                    // Get all users post by uid
                    .where("user.id", "==", context.params.userId)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(
                            doc => {
                                const data = doc.data();
                                // filter out the old user from the 'commenters' array
                                const newCommenters = data.commenters.filter(user => user === oldUser);

                                // Only push the new user if the updated users appears in the comments
                                if (data.commenters.length !== newCommenters.length) {
                                    newCommenters.push(newUser);
                                }

                                // Update the post with new data
                                db.doc(doc.ref.path).update({
                                        commenters: newCommenters,
                                        user: newUser
                                    }
                                );
                            }
                        )
                    })
                    .then(() => resolve(newUser))
                    .catch(error => reject(error));

            });
        }
        return Promise.resolve();
    });

/**
 * ==== FIRESTORE ====
 * Change user name and picture when a 'user' document is changed.
 * Changes Comments posted on other posts.
 */
export const editProfileCommentsOtherPosts = functions
    .region('europe-west1')
    .firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = change.after.data();

        // ...or the previous value before this update
        const previousValue = change.before.data();


        const oldUser = {
            name: previousValue.name,
            picture: previousValue.picture,
            id: context.params.userId
        };
        const newUser = {
            name: newValue.name,
            picture: newValue.picture,
            id: context.params.userId
        };
        console.log(oldUser);
        console.log(newUser);

        // Compare the two objects, if there is any change in name, picture
        if (JSON.stringify(oldUser) !== JSON.stringify(newUser)) {
            // Get all posts a user has commented on from the 'comments/{userId}' collection
            db.collection("comments").doc(context.params.userId).get().then(res => {
                const commentsPosted = res.data().comments;
                console.log(commentsPosted);
                return new Promise((resolve, reject) => {
                    // check if a user has any comments at all
                    if (commentsPosted.length > 0) {
                        commentsPosted.map(
                            el => {
                                db.collection("posts")
                                    .doc(el)
                                    .update(
                                        // Remove the old user from the 'commenters' field
                                        {
                                            commenters: admin.firestore.FieldValue.arrayRemove(oldUser)
                                        }
                                    )
                                    .then(() => {
                                        db.collection("posts")
                                            .doc(el)
                                            .update(
                                                // Then update the same post with the new user data
                                                {
                                                    commenters: admin.firestore.FieldValue.arrayUnion(newUser)
                                                }
                                            )
                                            .catch(error => error)
                                    })
                                    .then(() => resolve())
                                    .catch(error => reject(error));
                            }
                        )
                    } else {
                        resolve();
                    }
                });
            });
        }


        return Promise.resolve();
    });

/**
 * ==== FIRESTORE ====
 * Change event details in published posts when an event is edited.
 */
export const editEventPostUpdate = functions
    .region('europe-west1')
    .firestore
    .document('events/{eventId}')
    .onUpdate((change, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = change.after.data();

        return new Promise((resolve, reject) => {
            db.collection("posts")
                .where("event.id", "==", context.params.eventId)
                .get()
                .then(snapshot => {
                    snapshot.forEach(
                        doc => {
                            if (doc) {
                                db.collection("posts").doc(doc.ref.id).update({
                                    event: {
                                        id: context.params.eventId,
                                        ...newValue
                                    }
                                }).catch(error => reject(error))
                            }
                        }
                    )
                })
                .then(() => resolve(true))
                .catch(error => reject(error))
        })
    })


/**
 * ==== RT Database =====
 * Update --unread messages count-- when a message thread is created.
 * **/
export const updateUnreadMessages = functions
    .region('europe-west1')
    .database
    .ref('messages/{threadId}/{messageKey}')
    .onCreate((snapshot, context) => {
        const threadId = context.params.threadId;

        // threadID = userID + userID (using '<' comparison)
        const userId1 = threadId.substring(0, 28);
        const userId2 = threadId.substring(28, 56);

        const newMessage = snapshot.val();
        // find out which user to attribute unread message to
        // --> basically NOT the sender (aka '.from')
        const unreadUser = userId1 === newMessage.from ? userId2 : userId1;

        // All conversations with other users are listed under the 'chats/{userId}' node
        const pathToUnread = 'chats/' + unreadUser + '/' + newMessage.from;

        return new Promise(
            (resolve, reject) =>
                // Write as transaction to prevent concurrency issues
                rt.ref(pathToUnread).transaction(
                    chat => {
                        if (chat) {
                            if (chat.unreadCount) {
                                chat.unreadCount++;
                            } else {
                                chat.unreadCount = 1;
                            }
                            chat.lastMessage = Date.now();
                        }
                        return chat;
                    }, (error, committed) => {
                        if (error) {
                            reject(error)
                        }
                        if (!committed) {
                            reject("Change Rejected")
                        } else {
                            resolve(true);
                        }
                    }
                )
        );
    });

/**
 * ==== RT Database =====
 * Update --unread notifications count-- when a notification 'node' is created.
 * **/
export const updateUnreadNotifications = functions
    .region('europe-west1')
    .database
    .ref('notifications/{userId}/{notificationsKey}')
    .onCreate((snapshot, context) => {
        const userId = context.params.userId;
        const pathNotis = 'notificationsCount/' + userId;

        return new Promise(
            (resolve, reject) =>
                // Write as transaction to prevent concurrency issues
                rt.ref(pathNotis).transaction(
                    notifications => {
                        if (notifications === null) {
                            return {unreadCount: 0, lastMessage: Date.now()}
                        } else {
                            if (notifications.unreadCount) {
                                notifications.unreadCount++;
                            } else {
                                notifications.unreadCount = 1;
                            }
                            notifications.lastMessage = Date.now();
                            return notifications;
                        }
                    }, (error, committed) => {
                        if (error) {
                            reject(error)
                        }
                        if (!committed) {
                            reject("Change Rejected")
                        } else {
                            resolve(true);
                        }
                    }
                )
        );
    });


/**
 * ==== ALGOLIA SEARCH ====
 * Function to index users on algolia search engine.
 */
export const indexUsers = functions
    .region('europe-west1')
    .firestore
    .document("users/{userId}")
    .onWrite((change, context) => {

        // Check if doc is not deleted.
        if (change.after.exists) {
            const newValue = change.after.data();
            const id = change.after.id;

            // Save to ALGOLIA Index
            return indexU.saveObject({
                objectID: id,
                ...newValue
            }).then(({objectID}) => console.log(objectID))
                .catch(error => console.log(error));
        }
        // Document is deleted, delete Object from Index
        else {
            return indexU.deleteObject(change.before.id)
                .then(() => console.log("Object deleted"))
                .catch(error => console.log(error));
        }
    });

/**
 * ==== ALGOLIA SEARCH ====
 * Function to index users on algolia search engine.
 */
export const indexBands = functions
    .region('europe-west1')
    .firestore
    .document("bands/{bandId}")
    .onWrite((change, context) => {

        // Check if doc is not deleted.
        if (change.after.exists) {
            const newValue = change.after.data();
            const id = change.after.id;

            // Save to ALGOLIA Index
            return indexB.saveObject({
                objectID: id,
                ...newValue
            }).then(({objectID}) => console.log(objectID))
                .catch(error => console.log(error));
        }
        // Document is deleted, delete Object from Index
        else {
            return indexB.deleteObject(change.before.id)
                .then(() => console.log("Object deleted"))
                .catch(error => console.log(error));
        }
    });

/**
 * ==== ALGOLIA SEARCH ====
 * Function to index users on algolia search engine.
 */
export const indexEvents = functions
    .region('europe-west1')
    .firestore
    .document("events/{eventId}")
    .onWrite((change, context) => {

        // Check if doc is not deleted.
        if (change.after.exists) {
            const newValue = change.after.data();
            const id = change.after.id;

            // Save to ALGOLIA Index
            return indexE.saveObject({
                objectID: id,
                ...newValue
            }).then(({objectID}) => console.log(objectID))
                .catch(error => console.log(error));
        }
        // Document is deleted, delete Object from Index
        else {
            return indexE.deleteObject(change.before.id)
                .then(() => console.log("Object deleted"))
                .catch(error => console.log(error));
        }
    });

/** ===========================
 **         CRON JOBS
 ** ===========================
 */
export const scheduleDeleteNotifications = functions
    .pubsub.schedule("0 3 * * 0")
    .onRun(context => {
        console.log("Running: " + new Date(context.timestamp).toDateString());
        // TODO : Write This... ->
    })