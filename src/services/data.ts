
'use client';

// --- STORAGE SERVICE ---
// A simple service to abstract localStorage access and handle SSR.
const storageService = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') {
            return null;
        }
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    }
};

const getCollection = <T,>(key: string): T[] => {
    try {
        const data = storageService.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error parsing collection ${key} from localStorage`, error);
        return [];
    }
};

const saveCollection = <T,>(key: string, data: T[]) => {
    storageService.setItem(key, JSON.stringify(data));
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
    status: ProjectStatus;
    deadline: string;
    createdAt: string; // ISO String
}

export const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const projects = getCollection<Project>('projects');
    const newProject: Project = {
        ...projectData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    saveCollection('projects', projects);
    return newProject;
};

export const getProjects = (): Project[] => {
    return getCollection<Project>('projects');
};

export const getProjectsByUserId = (userId: string): Project[] => {
    const allProjects = getProjects();
    return allProjects.filter(p => p.userId === userId);
};

export const updateProject = (id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'userId'>>): Project | undefined => {
    const projects = getCollection<Project>('projects');
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex > -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...data };
        saveCollection('projects', projects);
        return projects[projectIndex];
    }
    return undefined;
};

export const deleteProject = (id: string) => {
    let projects = getCollection<Project>('projects');
    projects = projects.filter(p => p.id !== id);
    saveCollection('projects', projects);
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
    createdAt: string; // ISO String
}

export const addRequest = (requestData: Omit<IRequest, 'id' | 'createdAt'>): IRequest => {
    const requests = getCollection<IRequest>('requests');
    const newRequest: IRequest = {
        ...requestData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    requests.unshift(newRequest);
    saveCollection('requests', requests);
    return newRequest;
};

export const getRequestsByUserId = (userId: string): IRequest[] => {
    const allRequests = getCollection<IRequest>('requests');
    return allRequests.filter(r => r.userId === userId);
};

export const getAllRequests = (): IRequest[] => {
    return getCollection<IRequest>('requests');
};

export const updateRequestStatus = (id: string, status: RequestStatus) => {
    const requests = getCollection<IRequest>('requests');
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex > -1) {
        requests[requestIndex].status = status;
        saveCollection('requests', requests);
    }
};


// --- MESSAGING ---
export interface IMessage {
    from: 'client' | 'admin';
    text: string;
    timestamp: string; // ISO String
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
    lastMessageTimestamp: string; // ISO String
    unreadByAdmin: boolean;
    unreadByUser: boolean;
}

export const createMessageThread = (threadData: Omit<IMessageThread, 'id' | 'messages' | 'lastMessage' | 'lastMessageTimestamp'>, initialMessage: IMessage) => {
    const threads = getCollection<IMessageThread>('messageThreads');
    const newThread: IMessageThread = {
        ...threadData,
        id: crypto.randomUUID(),
        messages: [initialMessage],
        lastMessage: initialMessage.text,
        lastMessageTimestamp: initialMessage.timestamp,
    };
    threads.unshift(newThread);
    saveCollection('messageThreads', threads);
};

export const addMessageToThread = (threadId: string, message: IMessage, senderType: 'admin' | 'client') => {
    const threads = getCollection<IMessageThread>('messageThreads');
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex > -1) {
        threads[threadIndex].messages.push(message);
        threads[threadIndex].lastMessage = message.text;
        threads[threadIndex].lastMessageTimestamp = message.timestamp;
        threads[threadIndex].unreadByAdmin = senderType === 'client';
        threads[threadIndex].unreadByUser = senderType === 'admin';
        saveCollection('messageThreads', threads);
    }
};

export const getMessageThreads = (): IMessageThread[] => {
    return getCollection<IMessageThread>('messageThreads');
};

export const getMessageThreadsForUser = (userId: string): IMessageThread[] => {
    const allThreads = getCollection<IMessageThread>('messageThreads');
    return allThreads.filter(t => t.userId === userId);
};

export const markThreadAsRead = (threadId: string, readerType: 'admin' | 'user') => {
    const threads = getCollection<IMessageThread>('messageThreads');
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex > -1) {
        if (readerType === 'admin') {
            threads[threadIndex].unreadByAdmin = false;
        } else {
            threads[threadIndex].unreadByUser = false;
        }
        saveCollection('messageThreads', threads);
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
    timestamp: string; // ISO String
}

export interface SmsLog {
    id: string;
    to: string;
    message: string;
    success: boolean;
    response: string;
    timestamp: string; // ISO String
}

export const addEmailLog = (logData: Omit<EmailLog, 'id' | 'timestamp'>) => {
    const logs = getCollection<EmailLog>('emailLogs');
    const newLog: EmailLog = {
        ...logData,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    saveCollection('emailLogs', logs);
};

export const addSmsLog = (logData: Omit<SmsLog, 'id' | 'timestamp'>) => {
    const logs = getCollection<SmsLog>('smsLogs');
    const newLog: SmsLog = {
        ...logData,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    saveCollection('smsLogs', logs);
};

export const getLogs = (): { email: EmailLog[], sms: SmsLog[] } => {
    const email = getCollection<EmailLog>('emailLogs');
    const sms = getCollection<SmsLog>('smsLogs');
    return { email, sms };
};

export const deleteEmailLog = (id: string) => {
    let logs = getCollection<EmailLog>('emailLogs');
    logs = logs.filter(log => log.id !== id);
    saveCollection('emailLogs', logs);
};

export const deleteSmsLog = (id: string) => {
    let logs = getCollection<SmsLog>('smsLogs');
    logs = logs.filter(log => log.id !== id);
    saveCollection('smsLogs', logs);
};
