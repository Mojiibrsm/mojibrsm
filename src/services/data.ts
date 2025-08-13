
'use client';
import { db, storage } from './firestore';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

// --- SITE & CONTACT SETTINGS (Example of fetching a single document) ---
export const getSiteSettings = async () => {
    const docRef = doc(db, "content", "site");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export const getContactSettings = async () => {
    const docRef = doc(db, "content", "contact");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};


// --- PROJECT MANAGEMENT ---
export type ProjectStatus = 'Pending' | 'In Progress' | 'Completed';
export interface Project {
    id: string;
    userId: string;
    name: string;
    client: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
    notesImage?: string;
    status: ProjectStatus;
    deadline: string;
    createdAt: Timestamp;
}
export type ProjectFormData = Omit<Project, 'id' | 'createdAt'>;

export const addProject = async (projectData: ProjectFormData): Promise<Project> => {
    const docRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: serverTimestamp(),
    });
    return { ...projectData, id: docRef.id, createdAt: Timestamp.now() };
};

export const getProjects = async (): Promise<Project[]> => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};

export const getProjectsByUserId = async (userId: string): Promise<Project[]> => {
    const q = query(collection(db, "projects"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};

export const updateProject = async (id: string, data: Partial<ProjectFormData>): Promise<void> => {
    const projectRef = doc(db, "projects", id);
    await updateDoc(projectRef, data);
};

export const deleteProject = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "projects", id));
};


// --- SERVICE REQUESTS ---
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export interface IRequest {
    id: string;
    userId: string;
    clientName: string;
    clientEmail: string;
    service: string;
    details: string;
    status: RequestStatus;
    createdAt: Timestamp;
}
export type RequestFormData = Omit<IRequest, 'id' | 'createdAt'>;

export const addRequest = async (requestData: RequestFormData): Promise<IRequest> => {
    const docRef = await addDoc(collection(db, "requests"), {
        ...requestData,
        createdAt: serverTimestamp()
    });
    return { ...requestData, id: docRef.id, createdAt: Timestamp.now() };
};

export const getRequestsByUserId = async (userId: string): Promise<IRequest[]> => {
    const q = query(collection(db, "requests"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IRequest));
};

export const getAllRequests = async (): Promise<IRequest[]> => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IRequest));
};

export const updateRequestStatus = async (id: string, status: RequestStatus): Promise<void> => {
    const requestRef = doc(db, "requests", id);
    await updateDoc(requestRef, { status });
};


// --- MESSAGING ---
export interface IMessage {
    from: 'client' | 'admin';
    text: string;
    timestamp: Timestamp;
}
export interface IMessageThread {
    id: string;
    userId: string;
    clientName: string;
    clientEmail: string;
    clientAvatar: string;
    clientPhone: string;
    subject: string;
    messages: IMessage[];
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    unreadByAdmin: boolean;
    unreadByUser: boolean;
    type: 'contact';
}
export type ThreadFormData = Omit<IMessageThread, 'id' | 'messages' | 'lastMessage' | 'lastMessageTimestamp'>;

export const createMessageThread = async (threadData: ThreadFormData, initialMessage: Omit<IMessage, 'timestamp'>): Promise<IMessageThread> => {
    const messageWithTimestamp = { ...initialMessage, timestamp: serverTimestamp() };
    const docRef = await addDoc(collection(db, "messageThreads"), {
        ...threadData,
        messages: [messageWithTimestamp],
        lastMessage: initialMessage.text,
        lastMessageTimestamp: serverTimestamp(),
    });
    
    return { 
      ...threadData, 
      id: docRef.id, 
      messages: [{...initialMessage, timestamp: Timestamp.now()}], 
      lastMessage: initialMessage.text,
      lastMessageTimestamp: Timestamp.now()
    };
};

export const addMessageToThread = async (threadId: string, message: Omit<IMessage, 'timestamp'>, senderType: 'admin' | 'client'): Promise<void> => {
    const threadRef = doc(db, "messageThreads", threadId);
    const threadDoc = await getDoc(threadRef);
    if (!threadDoc.exists()) return;
    
    const currentThreadData = threadDoc.data() as IMessageThread;
    const currentMessages = currentThreadData.messages || [];
    const newMessages = [...currentMessages, {...message, timestamp: serverTimestamp()}];
    
    await updateDoc(threadRef, {
        messages: newMessages,
        lastMessage: message.text,
        lastMessageTimestamp: serverTimestamp(),
        unreadByAdmin: senderType === 'client',
        unreadByUser: senderType === 'admin',
    });
};

export const getMessageThreads = async (): Promise<IMessageThread[]> => {
    const q = query(collection(db, "messageThreads"), orderBy("lastMessageTimestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMessageThread));
};

export const getMessageThreadsForUser = async (userId: string): Promise<IMessageThread[]> => {
    const q = query(collection(db, "messageThreads"), where("userId", "==", userId), orderBy("lastMessageTimestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMessageThread));
};

export const markThreadAsRead = async (threadId: string, readerType: 'admin' | 'user'): Promise<void> => {
    const threadRef = doc(db, "messageThreads", threadId);
    const updateData = readerType === 'admin' ? { unreadByAdmin: false } : { unreadByUser: false };
    await updateDoc(threadRef, updateData);
};


// --- LOGGING ---
export interface EmailLog {
    id: string;
    to: string;
    subject: string;
    html: string;
    success: boolean;
    message: string;
    timestamp: Timestamp;
}
export type EmailLogData = Omit<EmailLog, 'id' | 'timestamp'>;

export interface SmsLog {
    id: string;
    to: string;
    message: string;
    success: boolean;
    response: string;
    timestamp: Timestamp;
}
export type SmsLogData = Omit<SmsLog, 'id' | 'timestamp'>;

export const addEmailLog = async (logData: EmailLogData) => {
    await addDoc(collection(db, "emailLogs"), { ...logData, timestamp: serverTimestamp() });
};

export const addSmsLog = async (logData: SmsLogData) => {
    await addDoc(collection(db, "smsLogs"), { ...logData, timestamp: serverTimestamp() });
};

export const getLogs = async (): Promise<{ email: EmailLog[], sms: SmsLog[] }> => {
    const emailQuery = query(collection(db, "emailLogs"), orderBy("timestamp", "desc"));
    const smsQuery = query(collection(db, "smsLogs"), orderBy("timestamp", "desc"));
    
    const [emailSnapshot, smsSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(smsQuery)
    ]);

    const email = emailSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailLog));
    const sms = smsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmsLog));
    return { email, sms };
};

export const deleteEmailLog = async (id: string) => {
    await deleteDoc(doc(db, "emailLogs", id));
};

export const deleteSmsLog = async (id: string) => {
    await deleteDoc(doc(db, "smsLogs", id));
};


// --- MEDIA LIBRARY ---
export interface IMediaItem {
    id: string;
    url: string;
    name: string;
    createdAt: Timestamp;
}
export type MediaItemData = Omit<IMediaItem, 'id' | 'createdAt'>;

export const addMediaItem = async (itemData: MediaItemData): Promise<IMediaItem> => {
    const docRef = await addDoc(collection(db, "mediaLibrary"), { 
        ...itemData,
        createdAt: serverTimestamp()
    });
    return { ...itemData, id: docRef.id, createdAt: Timestamp.now() };
};

export const getMediaItems = async (): Promise<IMediaItem[]> => {
    const q = query(collection(db, "mediaLibrary"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IMediaItem));
};

export const deleteMediaItem = async (item: IMediaItem): Promise<void> => {
    if (!item.url) {
      throw new Error("File URL is missing, cannot delete from Storage.");
    }
    
    const fileRef = ref(storage, item.url);
  
    await deleteObject(fileRef);
    await deleteDoc(doc(db, "mediaLibrary", item.id));
};

export const updateMediaItem = async (id: string, data: Partial<Omit<IMediaItem, 'id' | 'createdAt' | 'url'>>): Promise<void> => {
    const itemRef = doc(db, "mediaLibrary", id);
    await updateDoc(itemRef, data);
};
