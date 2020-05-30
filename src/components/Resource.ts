import * as types from './types';

export type Label = types.Label;

export interface Resource {
  labels: (
    reauthenticate: () => Promise<void>
  ) => Promise<{ labels: Label[] } | undefined>;
}
