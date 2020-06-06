import { gmail_v1 as gmailv1 } from 'googleapis';
import Gmail from '../Gmail';
import {
  Label,
  MessageHeading,
  Message,
  Resource,
} from '../components/Resource';
import { ResourceControl } from './ResourceControl';
import { Cache } from './Cache';

export default class ResourceImpl implements Resource, ResourceControl {
  private accessToken: string;

  private cache: Cache;

  constructor() {
    this.accessToken = '';
    this.cache = {
      message: {},
    };
  }

  // ResourceControl
  setAccessToken = (accessToken: string): void => {
    this.accessToken = accessToken;
  };

  clearCache = (): void => {
    this.cache = {
      message: {},
    };
  };

  // Resource
  labels = async (
    reauthenticate: () => Promise<void>
  ): Promise<{ labels: Label[] } | undefined> => {
    // cache read
    if (this.cache.labels) {
      return { labels: this.cache.labels };
    }
    // fetch
    const result = await Gmail.fetchJson<{
      labels: gmailv1.Schema$Label[];
    }>(this.accessToken, '/users/me/labels', async () => {
      await reauthenticate();
      return this.accessToken;
    });
    if (result.ok === false) {
      return undefined;
    }
    const { labels: gmailLabels = [] } = result.json;
    // 変換
    const labels = gmailLabels
      .filter((x) => x.labelListVisibility !== 'labelHide')
      .map((x) => ({ id: x.id || '', name: x.name || '' }));
    // cache store
    this.cache.labels = labels;
    return { labels };
  };

  messageHeading = async (
    arg: {
      messageId: string;
    },
    reauthenticate: () => Promise<void>
  ): Promise<MessageHeading | undefined> => {
    const { messageId } = arg;
    // cache read
    // TODO
    // fetch
    const result = await Gmail.fetchJson<gmailv1.Schema$Message>(
      this.accessToken,
      `/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
      async () => {
        await reauthenticate();
        return this.accessToken;
      }
    );
    if (result.ok === false) {
      return undefined;
    }
    const gmailMessageMeta = result.json;
    // 変換
    const messageHeading = Gmail.parseToMessageHeading(gmailMessageMeta);
    // cache store
    // TODO
    return messageHeading;
  };

  messageHeadings = async (
    arg: {
      labelId: string;
    },
    reauthenticate: () => Promise<void>
  ): Promise<{ messageHeadings: MessageHeading[] } | undefined> => {
    const { labelId } = arg;
    // cache read
    // TODO
    // fetch
    const maxResults = 100; // TODO
    const result = await Gmail.fetchJson<{
      messages: gmailv1.Schema$Message[];
      resultSizeEstimate: number;
      nextPageToken?: string;
    }>(
      this.accessToken,
      `/users/me/messages?labelIds=${labelId}&maxResults=${maxResults}`,
      async () => {
        await reauthenticate();
        return this.accessToken;
      }
    );
    if (result.ok === false) {
      return undefined;
    }
    const { messages: gmailMessages } = result.json;
    // 変換
    const messageIds = gmailMessages
      .map((x) => x.id)
      .filter((x): x is string => !!x);
    const messageHeadings = (
      await Promise.all(
        messageIds.map((x) =>
          this.messageHeading({ messageId: x }, reauthenticate)
        )
      )
    ).map((x, i) =>
      // TODO エラー処理
      x === undefined
        ? {
            id: messageIds[i],
            from: '',
            subject: 'error',
            snippet: '',
            unread: false,
          }
        : x
    );
    // cache store
    // TODO
    return { messageHeadings };
  };

  message = async (
    arg: {
      messageId: string;
    },
    reauthenticate: () => Promise<void>
  ): Promise<{ message: Message } | undefined> => {
    const { messageId } = arg;
    // cache read
    const cacheByMessageId = this.cache.message[messageId];
    if (cacheByMessageId) {
      // そのメッセージのキャッシュが存在する
      if (cacheByMessageId.body) {
        // そのメッセージの本文のキャッシュが存在する
        const { id, from, subject } = cacheByMessageId;
        const { type, text } = cacheByMessageId.body;
        return { message: { id, from, subject, type, text } };
      }
      // そのメッセージの本文のキャッシュが存在しない
    }
    // fetch
    const result = await Gmail.fetchJson<gmailv1.Schema$Message>(
      this.accessToken,
      `/users/me/messages/${messageId}?format=full&metadataHeaders=From,Subject`,
      async () => {
        if (reauthenticate !== undefined) {
          await reauthenticate();
        }
        return this.accessToken;
      }
    );

    if (result.ok === false) {
      return undefined;
    }
    const gmailMessage = result.json;
    // 変換
    const resourceMessage = Gmail.parseToMessage(gmailMessage);
    const { id, from, subject, snippet, body } = resourceMessage;
    const { type, text } = body;
    const message = { id, from, subject, snippet, type, text };
    // cache store
    this.cache.message[messageId] = resourceMessage;
    return { message };
  };
}
