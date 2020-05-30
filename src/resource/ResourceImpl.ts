import { Label, Resource } from '../components/Resource';

export default class ResourceImpl implements Resource {
  labels = async (): Promise<{ labels: Label[] } | undefined> => {
    const labels = [{ id: '1', name: 'label1' }];
    return { labels };
  };
}
