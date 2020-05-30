import React from 'react';

import styles from './ButtonDiv.module.css';

type Props = {
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const ButtonDiv: React.FC<Props> = React.memo((props: Props) => {
  const { children, className, onClick } = props;
  return (
    <div
      className={`${styles.ButtonDiv} ${className}`}
      onClick={onClick}
      onKeyPress={undefined}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
});

export default ButtonDiv;
