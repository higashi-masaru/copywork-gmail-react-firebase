import { gmail_v1 as gmailv1 } from 'googleapis';
import Gmail from '../Gmail';

import { Label, Resource } from '../components/Resource';
import { ResourceControl } from './ResourceControl';

export default class ResourceImpl implements Resource, ResourceControl {
  private accessToken: string;

  constructor() {
    this.accessToken = '';
  }

  // ResourceControl
  setAccessToken = (accessToken: string): void => {
    this.accessToken = accessToken;
  };

  // Resource
  labels = async (): Promise<{ labels: Label[] } | undefined> => {
    console.log('this.accessToken', this.accessToken);
    // fetch
    const result = await Gmail.fetchJson<{
      labels: gmailv1.Schema$Label[];
    }>(this.accessToken, '/users/me/labels');
    if (result.ok === false) {
      return undefined;
    }
    const { labels: gmailLabels = [] } = result.json;
    // 変換
    const labels = gmailLabels
      .filter((x) => x.labelListVisibility !== 'labelHide')
      .map((x) => ({ id: x.id || '', name: x.name || '' }));
    return { labels };
  };
}