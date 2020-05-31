import * as types from './types';

export type Label = types.Label;
export type Message = types.Message;

export interface Resource {
  labels: (
    reauthenticate: () => Promise<void>
  ) => Promise<{ labels: Label[] } | undefined>;
  message: (
    arg: {
      messageId: string;
    },
    reauthenticate: () => Promise<void>
  ) => Promise<{ message: Message } | undefined>;
}
