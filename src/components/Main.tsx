import React, { useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMount } from '../hooks';
import resource from '../resource';
import Labels from './Labels';
import * as types from './types';

import styles from './Main.module.css';

const initialState: {
  labels: types.WithState<types.Label[]>;
} = {
  labels: { state: 'initial' },
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

const Main: React.FC = React.memo(() => {
  const { parameter } = useParameter();
  const history = useHistory();
  console.log('parameter', parameter);

  const [labels, setLabels] = useState(initialState.labels);

  const fetchAndSetLabels = useCallback(async () => {
    setLabels({ state: 'loading' });
    const result = await resource.labels();
    if (result === undefined) {
      setLabels({ state: 'error', message: 'error' });
      return;
    }
    setLabels({ state: 'success', json: result.labels });
  }, []);

  useMount(() => {
    // 初期ロード時
    fetchAndSetLabels();
  });

  const handleLabelClick = useCallback(
    async (labelId: string) => {
      // ラベルクリック時
      history.push(`/${labelId}`);
    },
    [history]
  );

  return (
    <div className={styles.Main}>
      <div className={styles.Header}>header</div>
      <div className={styles.Body}>
        <div className={styles.Left}>
          <Labels labels={labels} onClick={handleLabelClick} />
        </div>
        <div className={styles.Center}>center</div>
        <div className={styles.Right}>right</div>
      </div>
      <div className={styles.Footer}>footer</div>
    </div>
  );
});

export default Main;
