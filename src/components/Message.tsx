import React, { useCallback } from 'react';
import * as types from './types';
import styles from './Message.module.css';

type MessageTextProps = {
  message: types.Message;
};

const escape: { [key: string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#x60;',
};

const htmlEscape = (s: string): string =>
  s.replace(/[<>&"'`]/g, (match) => escape[match]);

const MessageText: React.FC<MessageTextProps> = React.memo(
  (props: MessageTextProps) => {
    const { message } = props;
    const style = `
font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
font-size: 14px;
letter-spacing: .2px;
color: #202124;
padding: 0;
`;
    const createSrcDoc = () => {
      if (message.type === 'html') {
        const tag = 'span';
        const { text } = message;
        return `<base target="_blank"><${tag} style="${style}">${text}</${tag}>`;
      }
      const tag = 'pre';
      const text = htmlEscape(message.text);
      return `<${tag} style="${style}">${text}</${tag}>`;
    };
    const srcDoc = createSrcDoc();
    // TODO
    // const sandbox = 'allow-popups allow-same-origin';
    const sandbox = '';
    return (
      <div className={styles.MessageText}>
        <iframe sandbox={sandbox} title="message" srcDoc={srcDoc} />
      </div>
    );
  }
);

type Props = {
  message: types.WithState<types.Message>;
};

const Message: React.FC<Props> = React.memo((props: Props) => {
  const { message } = props;
  return (
    <div className={styles.Message}>
      {types.switchWithState(message, {
        initial: () => <>Loading</>,
        loading: () => <>Loading</>,
        error: () => <>Error</>,
        success: (json) => (
          <div className={styles.Message}>
            <div>{json.subject}</div>
            <div>{json.from}</div>
            <MessageText message={json} />
          </div>
        ),
      })}
    </div>
  );
});

export default Message;
