export type WithState<T> =
  | {
      state: 'initial';
    }
  | {
      state: 'loading';
    }
  | {
      state: 'error';
      message: string;
    }
  | {
      state: 'success';
      json: T;
    };

export const switchWithState = <T, U>(
  withState: WithState<T>,
  func: {
    initial: () => U;
    loading: () => U;
    error: () => U;
    success: (t: T) => U;
  }
): U => {
  switch (withState.state) {
    case 'initial':
      return func.initial();
    case 'loading':
      return func.loading();
    case 'error':
      return func.error();
    default:
      return func.success(withState.json);
  }
};

export type Label = {
  id: string;
  name: string;
};

export type MessageHeading = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  unread: boolean;
};

export type Message = {
  id: string;
  from: string;
  subject: string;
  type: 'html' | 'text';
  text: string;
};
