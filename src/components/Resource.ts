import * as types from './types';

export type Label = types.Label;

export interface Resource {
  labels: () => Promise<{ labels: Label[] } | undefined>;
}
