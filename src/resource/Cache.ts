import * as Resource from '../components/Resource';

type Label = Resource.Label;
type Message = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  unread: boolean;
  body?: {
    type: 'html' | 'text';
    text: string;
  };
};

export type Cache = {
  labels?: Label[];
  message: {
    [messageId: string]: Message;
  };
};
