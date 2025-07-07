import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';

// --- User Management ---
export interface FirestoreUser {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: 'Admin' | 'Client';
    createdAt: Timestamp;
}

export const addUser = async (user: FirebaseAuthUser) => {
    try {
        // Note: We don't store this document with the user's UID as the document ID
        // to allow for easier querying by Firestore's default IDs if needed.
        // A 'users' collection with document IDs being the user's UID is also a common pattern.
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: Timestamp.now(),
            role: 'Client' // Default role for new sign-ups
        });
    } catch (error) {
        console.error("Error adding user to Firestore: ", error);
    }
};

export const getUsers = (callback: (users: any[]) => void): Unsubscribe => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (querySnapshot) => {
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(users);
    }, (error) => {
        console.error("Error fetching users: ", error);
        callback([]);
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
