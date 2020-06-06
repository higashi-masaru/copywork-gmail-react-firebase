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

  messageHeadings = async (
    arg: {
      labelId: string;
    },
    reauthenticate: () => Promise<void>
  ): Promise<{ messageHeadings: MessageHeading[] } | undefined> => {
    const { labelId } = arg;
    const messageHeadings = [...Array(20)].map((x, i) => ({
      id: `id${`${i}`.padStart(3, '0')}`,
      from: `from${`${i}`.padStart(3, '0')}`,
      subject: `subject${`${i}`.padStart(3, '0')}`,
      snippet: `snippet${`${i}`.padStart(3, '0')}`,
      unread: x / 2 === 0,
    }));
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
