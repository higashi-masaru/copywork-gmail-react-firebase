import React, { useCallback } from 'react';

import ButtonDiv from '../components.basic/ButtonDiv';
import * as types from './types';

import styles from './Labels.module.css';

type LabelProps = {
  label: types.Label;
  onClick: (labelId: string) => void;
};

const Label: React.FC<LabelProps> = React.memo((props: LabelProps) => {
  const { label, onClick } = props;
  const { id, name } = label;
  const handleClick = useCallback(() => onClick(id), [id, onClick]);
  return (
    <ButtonDiv className={styles.Label} onClick={handleClick}>
      {name}
    </ButtonDiv>
  );
});

type Props = {
  labels: types.WithState<types.Label[]>;
  onClick: (labelId: string) => void;
};

const Labels: React.FC<Props> = React.memo((props: Props) => {
  const { labels, onClick } = props;
  return (
    <div className={styles.Labels}>
      {types.switchWithState(labels, {
        initial: () => <div>Loading</div>,
        loading: () => <div>Loading</div>,
        error: () => <div>Error</div>,
        success: (json) => (
          <>
            {json.map((x) => (
              <Label label={x} onClick={onClick} key={x.id} />
            ))}
          </>
        ),
      })}
    </div>
  );
});

export default Labels;
