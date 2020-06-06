import React, { useCallback } from 'react';
import ButtonDiv from '../components.basic/ButtonDiv';
import * as types from './types';
import styles from './MessageHeadings.module.css';

type MessageHeadingProps = {
  messageHeading: types.MessageHeading;
  onClick: (mailId: string) => void;
};

const MessageHeading: React.FC<MessageHeadingProps> = React.memo(
  (props: MessageHeadingProps) => {
    const { messageHeading, onClick } = props;
    const { id, from, subject, snippet, unread } = messageHeading;
    const handleClick = useCallback(() => onClick(id), [id, onClick]);
    return (
      <ButtonDiv
        className={`${styles.MessageHeading} ${unread && styles.Unread}`}
        onClick={handleClick}
      >
        <div className={styles.From}>{from}</div>
        <div className={styles.SubjectSnippet}>
          <div className={styles.Subject}>
            {subject.length > 0 ? subject : '（件名なし）'}
          </div>
          <div className={styles.Snippet}>{snippet}</div>
        </div>
      </ButtonDiv>
    );
  }
);

type Props = {
  messageHeadings: types.WithState<types.MessageHeading[]>;
  onClick: (mailId: string) => void;
};

const MessageHeadings: React.FC<Props> = React.memo((props: Props) => {
  const { messageHeadings, onClick } = props;
  return (
    <div className={styles.MessageHeadings}>
      {types.switchWithState(messageHeadings, {
        initial: () => <>Loading</>,
        loading: () => <>Loading</>,
        error: () => <>Error</>,
        success: (json) => {
          return (
            <>
              {json.map((x) => (
                <MessageHeading
                  messageHeading={x}
                  onClick={onClick}
                  key={x.id}
                />
              ))}
            </>
          );
        },
      })}
    </div>
  );
});

export default MessageHeadings;
