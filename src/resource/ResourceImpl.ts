import { gmail_v1 as gmailv1 } from 'googleapis';
import Gmail from '../Gmail';
import { Label, Resource } from '../components/Resource';
import { ResourceControl } from './ResourceControl';
import { Cache } from './Cache';

export default class ResourceImpl implements Resource, ResourceControl {
  private accessToken: string;

  private cache: Cache;

  constructor() {
    this.accessToken = '';
    this.cache = {};
  }

  // ResourceControl
  setAccessToken = (accessToken: string): void => {
    this.accessToken = accessToken;
  };

  clearCache = (): void => {
    this.cache = {};
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
}
