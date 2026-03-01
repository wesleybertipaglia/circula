export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  reputation: number;
  completedTransactions: number;
};

export type ExchangeType = 'donate' | 'exchange' | 'borrow';

export type ItemStatus = 'available' | 'reserved' | 'completed';

export type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  exchangeType: ExchangeType;
  status: ItemStatus;
  imageUrl: string;
  imageHint: string;
  ownerId: string;
  createdAt: string;
  reservedBy?: string;
};

export type Message = {
  id:string;
  senderId: string;
  text: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  itemId: string;
  participantIds: string[];
  messages: Message[];
  createdAt: string;
};
