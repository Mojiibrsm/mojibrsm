import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, Timestamp, onSnapshot, Unsubscribe, arrayUnion, setDoc, getDoc, getDocs } from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';

// --- User Management ---
export interface FirestoreUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    role: 'Admin' | 'Client';
    createdAt: Timestamp;
}

export const addUser = async (user: FirebaseAuthUser) => {
    const userRef = doc(db, "users", user.uid);
    try {
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            const usersQuery = query(collection(db, "users"));
            const querySnapshot = await getDocs(usersQuery);
            const isFirstUser = querySnapshot.empty;

            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: Timestamp.now(),
                role: isFirstUser ? 'Admin' : 'Client',
            });
        }
    } catch (error) {
        console.error("Error adding user to Firestore: ", error);
    }
};

export const getUsers = (callback: (users: FirestoreUser[]) => void): Unsubscribe => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (querySnapshot) => {
        const users = querySnapshot.docs.map(doc => ({
            uid: doc.id,
            ...(doc.data() as Omit<FirestoreUser, 'uid'>)
        }));
        callback(users);
    }, (error) => {
        console.error("Error fetching users: ", error);
        callback([]);
    });
};

export const getUserDoc = (uid: string, callback: (user: FirestoreUser | null) => void): Unsubscribe => {
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ uid: docSnap.id, ...docSnap.data() } as FirestoreUser);
        } else {
            console.warn(`User document not found for UID: ${uid}`);
            callback(null);
        }
    }, (error) => {
        console.error("Error fetching user document: ", error);
        callback(null);
    });
};


// --- Project Management ---
export type ProjectStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Project {
    id?: string;
    name: string;
    status: ProjectStatus;
    client: string;
    deadline: string; // Should be in YYYY-MM-DD format
    userId: string | null; // To associate with a user
}

export const addProject = async (projectData: Omit<Project, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "projects"), {
            ...projectData,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not add project");
    }
};

export const getProjects = (callback: (projects: Project[]) => void): Unsubscribe => {
    const q = query(collection(db, "projects"));
    return onSnapshot(q, (querySnapshot) => {
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    }, (error) => {
        console.error("Error fetching projects: ", error);
        callback([]);
    });
};

export const getProjectsByUserId = (userId: string, callback: (projects: Project[]) => void): Unsubscribe => {
    const q = query(collection(db, "projects"), where("userId", "==", userId));
    return onSnapshot(q, (querySnapshot) => {
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    }, (error) => {
        console.error(`Error fetching projects for user ${userId}: `, error);
        callback([]);
    });
};

export const updateProject = async (projectId: string, projectData: Partial<Project>) => {
    try {
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, projectData);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Could not update project");
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        await deleteDoc(doc(db, "projects", projectId));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Could not delete project");
    }
};


// --- Message Management ---
export interface IMessage {
    from: 'client' | 'admin';
    text: string;
    timestamp: Timestamp;
}

export interface IMessageThread {
    id?: string;
    userId: string;
    clientName: string;
    clientEmail: string;
    clientAvatar: string;
    subject: string;
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    unreadByAdmin: boolean;
    unreadByUser: boolean;
    messages: IMessage[];
}

export const createMessageThread = async (threadData: Omit<IMessageThread, 'id' | 'messages' | 'lastMessage' | 'lastMessageTimestamp'>, initialMessage: IMessage) => {
    try {
        const docRef = await addDoc(collection(db, "messageThreads"), {
            ...threadData,
            messages: [initialMessage],
            lastMessage: initialMessage.text,
            lastMessageTimestamp: initialMessage.timestamp,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error creating message thread: ", e);
        throw new Error("Could not create message thread");
    }
};

export const addMessageToThread = async (threadId: string, message: IMessage, from: 'client' | 'admin') => {
    try {
        const threadRef = doc(db, "messageThreads", threadId);
        const updateData: any = {
            messages: arrayUnion(message),
            lastMessage: message.text,
            lastMessageTimestamp: message.timestamp,
        };
        if (from === 'client') {
            updateData.unreadByAdmin = true;
            updateData.unreadByUser = false;
        } else { // from admin
            updateData.unreadByUser = true;
            updateData.unreadByAdmin = false;
        }
        await updateDoc(threadRef, updateData);
    } catch (e) {
        console.error("Error adding message to thread: ", e);
        throw new Error("Could not add message");
    }
};

export const getMessageThreadsForUser = (userId: string, callback: (threads: IMessageThread[]) => void): Unsubscribe => {
    const q = query(collection(db, "messageThreads"), where("userId", "==", userId));
    return onSnapshot(q, (querySnapshot) => {
        const threads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMessageThread));
        callback(threads.sort((a, b) => b.lastMessageTimestamp.toMillis() - a.lastMessageTimestamp.toMillis()));
    }, (error) => {
        console.error(`Error fetching message threads for user ${userId}: `, error);
        callback([]);
    });
};

export const getMessageThreads = (callback: (threads: IMessageThread[]) => void): Unsubscribe => {
    const q = query(collection(db, "messageThreads"));
    return onSnapshot(q, (querySnapshot) => {
        const threads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMessageThread));
        callback(threads.sort((a, b) => b.lastMessageTimestamp.toMillis() - a.lastMessageTimestamp.toMillis()));
    }, (error) => {
        console.error("Error fetching message threads: ", error);
        callback([]);
    });
};

export const markThreadAsRead = async (threadId: string, userType: 'admin' | 'user') => {
    try {
        const threadRef = doc(db, "messageThreads", threadId);
        const updateData: any = {};
        if (userType === 'admin') {
            updateData.unreadByAdmin = false;
        } else {
            updateData.unreadByUser = false;
        }
        await updateDoc(threadRef, updateData);
    } catch (e) {
        console.error("Error marking thread as read: ", e);
    }
}
