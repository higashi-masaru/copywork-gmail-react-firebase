import React from 'react';
import { useParams } from 'react-router-dom';

import styles from './Main.module.css';

const useParameter = (): {
  parameter: { labelId: string; messageId?: string };
} => {
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
  console.log('parameter', parameter);
  return (
    <div className={styles.Main}>
      <div className={styles.Header}>header</div>
      <div className={styles.Body}>
        <div className={styles.Left}>left</div>
        <div className={styles.Center}>center</div>
        <div className={styles.Right}>right</div>
      </div>
      <div className={styles.Footer}>footer</div>
    </div>
  );
});

export default Main;
