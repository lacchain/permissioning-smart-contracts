// Libs
import React from 'react';
import PropTypes from 'prop-types';
//import { Box, Chip, Grid, TableCell, TableRow } from '@material-ui/core';
import { Tooltip, Text } from 'rimble-ui';
// Rimble Components
import { Pill, Flex, Button } from 'rimble-ui';

// Styles
import styles from './styles.module.scss';

type EnodeRowApprove = {
  isAdmin: boolean;
  handleApproved: (row: number) => void;
  index: number;
  enode: string;
  nodeType: string;
  organization: string;
  name: string;

};

const EnodeRowApprove: React.FC<EnodeRowApprove> = ({
  isAdmin,
  handleApproved,
  index,
  enode,
  nodeType,
  organization,
  name,

}) => (

  <tr className={styles.row}>
    <td>
      <Flex alignItems="center" className={styles.tooltipFix}>
        <Text className={styles.ellipsis} fontSize="14px">
          {nodeType}
          </Text>
      </Flex>
    </td>
    <td>
      <Flex alignItems="center" className={styles.tooltipFix}>
        <Text className={styles.ellipsis} fontSize="14px">
        {name}
        </Text>
      </Flex>
    </td>
    <td>
      <Flex alignItems="center" className={styles.tooltipFix}>
        <Text className={styles.ellipsis} fontSize="14px">
        {organization}
        </Text>
      </Flex>
    </td>
    <td>
      <Flex alignItems="center" className={styles.tooltipFix}>
        <Text className={styles.ellipsis} fontSize="14px">
        {enode}
        </Text>
      </Flex>
    </td>
    <td>
    <Flex alignItems="center">
    {isAdmin &&  (
      <Button icon="CheckCircle" size="medium" mainColor="#25D78F" onClick={() => handleApproved(index)} isAdmin={isAdmin}>
        add
      </Button>

    )}
     </Flex>
    </td>
  </tr>
);

EnodeRowApprove.propTypes = {


  isAdmin: PropTypes.bool.isRequired,

};

export default EnodeRowApprove;
