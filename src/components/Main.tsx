import React, { useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMount } from '../hooks';
import resource from '../resource';
import Labels from './Labels';
import MessageHeadings from './MessageHeadings';
import Message from './Message';
import * as types from './types';

import styles from './Main.module.css';

type Props = {
  onReauthenticate: () => Promise<void>;
};

const initialState: {
  labels: types.WithState<types.Label[]>;
  messageHeadings: types.WithState<types.MessageHeading[]>;
  message: types.WithState<types.Message>;
} = {
  labels: { state: 'initial' },
  messageHeadings: { state: 'initial' },
  message: { state: 'initial' },
};

const useParameter = () => {
  const { labelId = 'INBOX', messageId } = useParams();
  return {
    parameter: {
      labelId,
      messageId,
    },
  };
};

const Main: React.FC<Props> = React.memo((props: Props) => {
  const { onReauthenticate } = props;
  const { parameter } = useParameter();
  const history = useHistory();
  console.log('parameter', parameter);

  const [labels, setLabels] = useState(initialState.labels);
  const [messageHeadings, setMessageHeadings] = useState(
    initialState.messageHeadings
  );
  const [message, setMessage] = useState(initialState.message);

  const fetchAndSetLabels = useCallback(async () => {
    setLabels({ state: 'loading' });
    const result = await resource.labels(onReauthenticate);
    if (result === undefined) {
      setLabels({ state: 'error', message: 'error' });
      return;
    }
    setLabels({ state: 'success', json: result.labels });
  }, [onReauthenticate]);
  const fetchAndSetMessageHeadings = useCallback(
    async (arg: { labelId: string }) => {
      const { labelId } = arg;
      setMessageHeadings({ state: 'loading' });
      const result = await resource.messageHeadings(
        { labelId },
        onReauthenticate
      );
      if (result === undefined) {
        setMessageHeadings({ state: 'error', message: 'error' });
        return;
      }
      setMessageHeadings({ state: 'success', json: result.messageHeadings });
    },
    [onReauthenticate]
  );
  const fetchAndSetMessage = useCallback(
    async (arg: { messageId: string }) => {
      const { messageId } = arg;
      setMessage({ state: 'loading' });
      const result = await resource.message({ messageId }, onReauthenticate);
      if (result === undefined) {
        setMessage({ state: 'error', message: 'error' });
        return;
      }
      setMessage({ state: 'success', json: result.message });
    },
    [onReauthenticate]
  );

  useMount(() => {
    // 初期ロード時
    fetchAndSetLabels();
    if (parameter.messageId === undefined) {
      // メッセージ一覧の表示
      const { labelId } = parameter;
      fetchAndSetMessageHeadings({ labelId });
    } else {
      // メッセージの表示
      const { messageId } = parameter;
      fetchAndSetMessage({ messageId });
    }
  });

  const handleLabelClick = useCallback(
    async (labelId: string) => {
      // ラベルクリック時
      history.push(`/${labelId}`);
    },
    [history]
  );
  const handleMessageHeadingClick = useCallback(
    async (messageId: string) => {
      // メッセージ見出しクリック時
      const { labelId } = parameter;
      history.push(`/${labelId}/${messageId}`);
    },
    [history, parameter]
  );

  return (
    <div className={styles.Main}>
      <div className={styles.Header}>header</div>
      <div className={styles.Body}>
        <div className={styles.Left}>
          <Labels
            labels={labels}
            onClick={handleLabelClick}
            onReload={fetchAndSetLabels}
          />
        </div>
        <div className={styles.Center}>
          {parameter.messageId === undefined ? (
            <MessageHeadings
              messageHeadings={messageHeadings}
              onClick={handleMessageHeadingClick}
            />
          ) : (
            <Message message={message} />
          )}
        </div>
        <div className={styles.Right}>right</div>
      </div>
      <div className={styles.Footer}>footer</div>
    </div>
  );
});

export default Main;
