// Libs
import React from 'react';
// Rimble Components
import { Flex, Heading } from 'rimble-ui';
// Styles
import styles from './styles.module.scss';

const AppBar: React.FC<{}> = () => (
  <Flex
    position="sticky"
    top="0"
    height="100px"
    alignItems="center"
    justifyContent="space-between"
    bg="white"
    className={styles.appBar}
    pl={4}
    pr={5}
    width="100%"
    zIndex="2"
  >
    <Heading.h3>LACCHAIN Besu Permissioning</Heading.h3>
    <img src="https://www.lacchain.net/assets/images/logo-lacchain-footer.png" alt="LACCHAIN" height={40} />
  </Flex>
);

export default AppBar;
