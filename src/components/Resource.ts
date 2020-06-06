import * as types from './types';

export type Label = types.Label;
export type MessageHeading = types.MessageHeading;
export type Message = types.Message;

export interface Resource {
  labels: (
    reauthenticate: () => Promise<void>
  ) => Promise<{ labels: Label[] } | undefined>;
  messageHeadings: (
    arg: {
      labelId: string;
    },
    reauthenticate: () => Promise<void>
  ) => Promise<{ messageHeadings: MessageHeading[] } | undefined>;
  message: (
    arg: {
      messageId: string;
    },
    reauthenticate: () => Promise<void>
  ) => Promise<{ message: Message } | undefined>;
}
