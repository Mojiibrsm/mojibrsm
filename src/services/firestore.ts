
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc, Timestamp, writeBatch, orderBy } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

// User Management
export interface FirestoreUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: 'Admin' | 'Client';
  createdAt: Timestamp;
}

export const addUserToFirestore = async (user: FirebaseUser) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const isAdminQuery = query(collection(db, 'users'), where('role', '==', 'Admin'));
    const adminSnapshot = await getDocs(isAdminQuery);
    const hasAdmin = !adminSnapshot.empty;
    
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      role: hasAdmin ? 'Client' : 'Admin',
      createdAt: Timestamp.now(),
    });
  }
};

export const getUsers = (callback: (users: FirestoreUser[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as FirestoreUser);
    callback(users);
  });
};

export const updateUserRole = (uid: string, role: 'Admin' | 'Client') => {
  const userRef = doc(db, 'users', uid);
  return updateDoc(userRef, { role });
};


// Project Management
export type ProjectStatus = 'Pending' | 'In Progress' | 'Completed';
export interface Project {
    id?: string;
    userId: string;
    name: string;
    client: string;
    status: ProjectStatus;
    deadline: string;
    createdAt: Timestamp;
}

export const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: Timestamp.now(),
    });
};

export const getProjects = (callback: (projects: Project[]) => void) => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    });
};

export const getProjectsByUserId = (userId: string, callback: (projects: Project[]) => void) => {
    const q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
     return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    });
};

export const updateProject = (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    return updateDoc(doc(db, 'projects', id), data);
};

export const deleteProject = (id: string) => {
    return deleteDoc(doc(db, 'projects', id));
};


// Service Requests
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export interface IRequest {
    id?: string;
    userId: string;
    clientName: string;
    clientEmail: string;
    service: string;
    details: string;
    status: RequestStatus;
    createdAt: Timestamp;
}

export const addRequest = (requestData: Omit<IRequest, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, 'requests'), {
        ...requestData,
        createdAt: Timestamp.now(),
    });
};

export const getRequestsByUserId = (userId: string, callback: (requests: IRequest[]) => void) => {
    const q = query(collection(db, 'requests'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IRequest));
        callback(requests);
    });
};

export const getAllRequests = (callback: (requests: IRequest[]) => void) => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IRequest));
        callback(requests);
    });
};

export const updateRequestStatus = (id: string, status: RequestStatus) => {
    return updateDoc(doc(db, 'requests', id), { status });
};


// Messaging
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
    messages: IMessage[];
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    unreadByAdmin: boolean;
    unreadByUser: boolean;
}

export const createMessageThread = async (threadData: Omit<IMessageThread, 'id' | 'messages' | 'lastMessage' | 'lastMessageTimestamp'>, initialMessage: IMessage) => {
    const threadCollection = collection(db, 'messageThreads');
    const newThreadRef = doc(threadCollection);
    
    await setDoc(newThreadRef, {
        ...threadData,
        lastMessage: initialMessage.text,
        lastMessageTimestamp: initialMessage.timestamp,
        messages: [initialMessage]
    });
};

export const addMessageToThread = async (threadId: string, message: IMessage, senderType: 'admin' | 'client') => {
    const threadRef = doc(db, 'messageThreads', threadId);
    const threadSnap = await getDoc(threadRef);
    if (!threadSnap.exists()) { throw new Error("Thread not found"); }

    const threadData = threadSnap.data() as IMessageThread;
    const updatedMessages = [...threadData.messages, message];
    
    const updates: Partial<IMessageThread> = {
        messages: updatedMessages,
        lastMessage: message.text,
        lastMessageTimestamp: message.timestamp,
    };
    
    if (senderType === 'client') {
        updates.unreadByAdmin = true;
        updates.unreadByUser = false;
    } else { // sender is admin
        updates.unreadByAdmin = false;
        updates.unreadByUser = true;
    }

    await updateDoc(threadRef, updates);
};

export const getMessageThreads = (callback: (threads: IMessageThread[]) => void) => {
    const q = query(collection(db, 'messageThreads'), orderBy('lastMessageTimestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMessageThread));
        callback(threads);
    });
};

export const getMessageThreadsForUser = (userId: string, callback: (threads: IMessageThread[]) => void) => {
    const q = query(collection(db, 'messageThreads'), where('userId', '==', userId), orderBy('lastMessageTimestamp', 'desc'));
     return onSnapshot(q, (snapshot) => {
        const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMessageThread));
        callback(threads);
    });
};

export const markThreadAsRead = (threadId: string, readerType: 'admin' | 'user') => {
    const threadRef = doc(db, 'messageThreads', threadId);
    if (readerType === 'admin') {
        return updateDoc(threadRef, { unreadByAdmin: false });
    } else {
        return updateDoc(threadRef, { unreadByUser: false });
    }
};
