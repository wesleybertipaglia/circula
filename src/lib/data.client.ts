'use client';

import { USERS } from './users.mock';
import type { User, Item, ExchangeType, Conversation, Message } from './types';
import { ITEMS } from './items.mock';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = window.localStorage.getItem(key);
  if (item) {
    try {
        return JSON.parse(item) as T;
    } catch (e) {
        console.error(`Error parsing JSON from localStorage key "${key}":`, e);
        return defaultValue;
    }
  }
  window.localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

const setToStorage = <T>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const CONVERSATIONS_KEY = 'circula-conversations';

export const getUsers = (): User[] => getFromStorage<User[]>('circula-users', USERS);

export const getUser = (userId: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === userId);
};

export const addUser = (user: Omit<User, 'id' | 'reputation' | 'completedTransactions'>): User => {
    const users = getUsers();
    const newUser: User = {
        ...user,
        id: `user-${Date.now()}`,
        reputation: 100,
        completedTransactions: 0,
    };
    const newUsers = [...users, newUser];
    setToStorage('circula-users', newUsers);
    return newUser;
}

let allItems: Item[] | null = null;
const getAllItems = (): Item[] => {
    if (allItems) return allItems;
    allItems = getFromStorage<Item[]>('circula-items', ITEMS);
    return allItems;
}


export const getItems = (filters?: {
  city?: string;
  exchangeType?: ExchangeType[];
  search?: string;
}): Item[] => {
    let items = getAllItems();
    
    // The logic to make all items appear in the user's city has been removed
    // to fix the ownership bug. Now it just shows all items.

    if(filters?.exchangeType && filters.exchangeType.length > 0) {
        items = items.filter(item => filters.exchangeType?.includes(item.exchangeType));
    }

    if(filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        items = items.filter(item => item.title.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
    }
    
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getItem = (itemId: string): Item | undefined => {
  const items = getItems();
  return items.find(i => i.id === itemId);
};

export const addItem = (item: Omit<Item, 'id' | 'createdAt'>, owner: User): Item => {
    const items = getAllItems();
    const newItem: Item = {
        ...item,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    const newItems = [newItem, ...items];
    setToStorage('circula-items', newItems);
    allItems = newItems; // update cache
    return newItem;
}

export const getConversations = (): Conversation[] => getFromStorage<Conversation[]>(CONVERSATIONS_KEY, []);

export const getConversation = (conversationId: string): Conversation | undefined => {
    const conversations = getConversations();
    return conversations.find(c => c.id === conversationId);
}

export const getConversationsForUser = (userId: string): Conversation[] => {
    const conversations = getConversations();
    return conversations
        .filter(c => c.participantIds.includes(userId))
        .sort((a, b) => {
            const lastMessageA = a.messages[a.messages.length - 1];
            const lastMessageB = b.messages[b.messages.length - 1];
            if (!lastMessageA) return 1;
            if (!lastMessageB) return -1;
            return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
        });
}

export const findOrCreateConversation = (itemId: string, inquirerId: string, ownerId: string): Conversation => {
    const conversations = getConversations();
    let conversation = conversations.find(c => 
        c.itemId === itemId && 
        c.participantIds.includes(inquirerId) && 
        c.participantIds.includes(ownerId)
    );

    if (conversation) {
        return conversation;
    }

    const newConversation: Conversation = {
        id: `convo-${Date.now()}`,
        itemId: itemId,
        participantIds: [inquirerId, ownerId],
        messages: [],
        createdAt: new Date().toISOString(),
    };

    const newConversations = [newConversation, ...conversations];
    setToStorage(CONVERSATIONS_KEY, newConversations);
    return newConversation;
}

export const addMessage = (conversationId: string, senderId: string, text: string): Conversation | undefined => {
    const conversations = getConversations();
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);

    if (conversationIndex === -1) {
        return undefined;
    }

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: senderId,
        text: text,
        timestamp: new Date().toISOString(),
    };

    const updatedConversation = {
        ...conversations[conversationIndex],
        messages: [...conversations[conversationIndex].messages, newMessage],
    };

    conversations[conversationIndex] = updatedConversation;
    setToStorage(CONVERSATIONS_KEY, conversations);

    return updatedConversation;
}
