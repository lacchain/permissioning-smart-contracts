import React from 'react';
import { Flex, Heading } from 'rimble-ui';
import styles from './styles.module.scss';

const Footer: React.FC<{}> = () => {
  return (
    <div>
      <a href="http://www.pegasys.tech" target="_blank" rel="noopener noreferrer" className={styles.footerLogo}>
        Created by PegaSys
      </a>
      <a href="http://www.lacchain.net" target="_blank" rel="noopener noreferrer" className={styles.footerLogo2}>
        Adapted by LACCHAIN
      </a>
    </div>
  );
};

export default Footer;
