
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

export const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const projects = getProjects();
    const newProject = { 
        ...projectData, 
        id: `proj_${new Date().getTime()}`,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('projects', JSON.stringify([...projects, newProject]));
};


export const getProjects = (): Project[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('projects');
    return data ? JSON.parse(data) : [];
};

export const updateProject = (id: string, updatedData: Partial<ProjectFormData>) => {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
        projects[index] = { ...projects[index], ...updatedData };
        localStorage.setItem('projects', JSON.stringify(projects));
    }
};

export const deleteProject = (id: string) => {
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('projects', JSON.stringify(projects));
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
    createdAt: string;
}

export const addRequest = (requestData: Omit<IRequest, 'id' | 'createdAt'>) => {
    const requests = getAllRequests();
    const newRequest = {
        ...requestData,
        id: `req_${new Date().getTime()}`,
        createdAt: new Date().toISOString(),
    };
    localStorage.setItem('requests', JSON.stringify([...requests, newRequest]));
};

export const getRequestsByUserId = (userId: string): IRequest[] => {
    const allRequests = getAllRequests();
    return allRequests.filter(r => r.userId === userId);
};

export const getAllRequests = (): IRequest[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('requests');
    return data ? JSON.parse(data) : [];
};

export const updateRequestStatus = (id: string, status: RequestStatus) => {
    const requests = getAllRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
        requests[index].status = status;
        localStorage.setItem('requests', JSON.stringify(requests));
    }
};


// --- MESSAGING ---
export interface IMessage {
    from: 'client' | 'admin';
    text: string;
    timestamp: string;
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
    lastMessageTimestamp: string;
    unreadByAdmin: boolean;
    unreadByUser: boolean;
    type?: 'contact'; // To distinguish contact form messages
}

export const getMessageThreads = (): IMessageThread[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('messageThreads');
    return data ? JSON.parse(data) : [];
};

export const getMessageThreadsForUser = (userId: string): IMessageThread[] => {
    const allThreads = getMessageThreads();
    return allThreads.filter(t => t.userId === userId);
};

export const createMessageThread = (threadData: Omit<IMessageThread, 'id' | 'messages' | 'lastMessage' | 'lastMessageTimestamp'>, initialMessage: IMessage) => {
    const threads = getMessageThreads();
    const newThread: IMessageThread = {
        ...threadData,
        id: `thread_${new Date().getTime()}`,
        messages: [initialMessage],
        lastMessage: initialMessage.text,
        lastMessageTimestamp: new Date().toISOString(),
    };
    localStorage.setItem('messageThreads', JSON.stringify([...threads, newThread]));
};

export const addMessageToThread = (threadId: string, message: IMessage, senderType: 'admin' | 'client') => {
    const threads = getMessageThreads();
    const index = threads.findIndex(t => t.id === threadId);
    if (index !== -1) {
        threads[index].messages.push(message);
        threads[index].lastMessage = message.text;
        threads[index].lastMessageTimestamp = new Date().toISOString();
        if (senderType === 'client') {
            threads[index].unreadByAdmin = true;
        } else {
            threads[index].unreadByUser = true;
        }
        localStorage.setItem('messageThreads', JSON.stringify(threads));
    }
};

export const markThreadAsRead = (threadId: string, readerType: 'admin' | 'user') => {
    const threads = getMessageThreads();
    const index = threads.findIndex(t => t.id === threadId);
    if (index !== -1) {
        if (readerType === 'admin') {
            threads[index].unreadByAdmin = false;
        } else {
            threads[index].unreadByUser = false;
        }
        localStorage.setItem('messageThreads', JSON.stringify(threads));
    }
};


// --- LOGGING ---
export interface EmailLog {
    id: string;
    to: string;
    subject: string;
    html: string;
    success: boolean;
    message: string;
    timestamp: string;
}
export interface SmsLog {
    id: string;
    to: string;
    message: string;
    success: boolean;
    response: string;
    timestamp: string;
}

export const addEmailLog = (logData: Omit<EmailLog, 'id' | 'timestamp'>) => {
    const logs = getLogs();
    const newLog = { ...logData, id: `email_${new Date().getTime()}`, timestamp: new Date().toISOString() };
    logs.email.unshift(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
};

export const addSmsLog = (logData: Omit<SmsLog, 'id' | 'timestamp'>) => {
    const logs = getLogs();
    const newLog = { ...logData, id: `sms_${new Date().getTime()}`, timestamp: new Date().toISOString() };
    logs.sms.unshift(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
};

export const getLogs = (): { email: EmailLog[], sms: SmsLog[] } => {
    if (typeof window === 'undefined') return { email: [], sms: [] };
    const data = localStorage.getItem('logs');
    return data ? JSON.parse(data) : { email: [], sms: [] };
};

export const deleteEmailLog = (id: string) => {
    const logs = getLogs();
    logs.email = logs.email.filter(log => log.id !== id);
    localStorage.setItem('logs', JSON.stringify(logs));
};

export const deleteSmsLog = (id: string) => {
    const logs = getLogs();
    logs.sms = logs.sms.filter(log => log.id !== id);
    localStorage.setItem('logs', JSON.stringify(logs));
};


// --- MEDIA LIBRARY ---
export interface IMediaItem {
    id: string; // Firestore document ID
    fileId: string; // ImageKit file ID
    url: string;
    name: string;
    createdAt: string;
}

export const getMediaItems = async (): Promise<IMediaItem[]> => {
    const q = query(collection(db, "mediaLibrary"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as IMediaItem
    });
};

export const addMediaItem = async (itemData: Omit<IMediaItem, 'id' | 'createdAt'>): Promise<IMediaItem> => {
    const docRef = await addDoc(collection(db, "mediaLibrary"), { 
        ...itemData,
        createdAt: serverTimestamp()
    });

    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    const createdAt = data?.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();

    return { 
        ...itemData, 
        id: docRef.id, 
        createdAt
    };
};

export const deleteMediaItem = async (item: IMediaItem): Promise<void> => {
    if (!item.fileId) {
      throw new Error("File ID is missing, cannot delete from ImageKit.");
    }
    
    // Call the backend API to delete from ImageKit
    await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: item.fileId })
    });

    // Delete the document from Firestore
    await deleteDoc(doc(db, "mediaLibrary", item.id));
};

export const updateMediaItem = async (id: string, data: Partial<Omit<IMediaItem, 'id' | 'createdAt' | 'url' | 'fileId'>>): Promise<void> => {
    const itemRef = doc(db, "mediaLibrary", id);
    await updateDoc(itemRef, data);
};
