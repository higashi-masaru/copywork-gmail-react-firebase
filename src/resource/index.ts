import { Resource } from '../components/Resource';
import { ResourceControl } from './ResourceControl';
import ResourceImpl from './ResourceImpl';

const resourceImpl = new ResourceImpl();

const resource: Resource = resourceImpl;
export const resourceControl: ResourceControl = resourceImpl;

export default resource;
