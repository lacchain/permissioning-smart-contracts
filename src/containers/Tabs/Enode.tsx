// Libs
import React from 'react';
import PropTypes from 'prop-types';
import idx from 'idx';
import { utils } from 'ethers';
// Context
import { useAdminData } from '../../context/adminData';
import { useNodeData } from '../../context/nodeData';
// Utils
import useTab from './useTab';
import {
  identifierToParams,
  paramsToIdentifier,
  enodeToParams,
  Enode,
  isEqual,
  isValidEnode,
  getGeohash
} from '../../util/enodetools';
import { errorToast } from '../../util/tabTools';
// Components
import EnodeTab from '../../components/EnodeTab/EnodeTab';
import LoadingPage from '../../components/LoadingPage/LoadingPage';
import NoContract from '../../components/Flashes/NoContract';
// Constants
import {
  PENDING_ADDITION,
  PENDING_REMOVAL,
  FAIL_ADDITION,
  FAIL_REMOVAL,
  SUCCESS,
  FAIL
} from '../../constants/transactions';

type EnodeTabContainerProps = {
  isOpen: boolean;
};

const EnodeTabContainer: React.FC<EnodeTabContainerProps> = ({ isOpen }) => {
  const types = { Bootnode: 0, Validator: 1, Writer: 2, Observer: 3 };
  const { isAdmin, dataReady: adminDataReady } = useAdminData();
  const { allowlist, isReadOnly, dataReady, nodeRulesContract } = useNodeData();

  const { list, modals, toggleModal, addTransaction, updateTransaction, deleteTransaction, openToast } = useTab(
    allowlist,
    identifierToParams
  );

  if (!!nodeRulesContract) {
    const handleAdd = async (value: any) => {
      const { enode, type, organization, name, did } = value;
      const { enodeHigh, enodeLow, ip, port } = enodeToParams(enode);

      const geoHash = await getGeohash(ip);
      const identifier = paramsToIdentifier({
        enodeHigh,
        enodeLow,
        ip,
        port,
        nodeType: type,
        geoHash,
        name,
        organization,
        did
      });
      try {
        const tx = await nodeRulesContract!.functions.addEnode(
          utils.hexlify(enodeHigh),
          utils.hexlify(enodeLow),
          utils.hexlify(ip),
          utils.bigNumberify(port),
          // @ts-ignore
          utils.hexlify(types[type]),
          geoHash,
          name,
          organization,
          did
        );
        toggleModal('add')(false);
        addTransaction(identifier, PENDING_ADDITION);
        const receipt = await tx.wait(3); // wait on receipt confirmations
        const addEvent = receipt.events!.filter(e => e.event && e.event === 'NodeAdded').pop();
        if (!addEvent) {
          openToast(value, FAIL, `Error while processing node: ${value.enode}`);
        } else {
          const addSuccessResult = idx(addEvent, _ => _.args[0]);
          if (addSuccessResult === undefined) {
            openToast(value, FAIL, `Error while adding node: ${value.enode}`);
          } else if (Boolean(addSuccessResult)) {
            openToast(value, SUCCESS, `New node added: ${value.enode}`);
          } else {
            openToast(value, FAIL, `Node "${value.enode}" is already added`);
          }
        }
        deleteTransaction(identifier);
      } catch (e) {
        console.log(e);
        toggleModal('add')(false);
        updateTransaction(identifier, FAIL_ADDITION);
        errorToast(e, identifier, openToast, () =>
          openToast(
            identifier,
            FAIL,
            'Could not add node',
            `${enodeHigh}${enodeLow} was unable to be added. Please try again`
          )
        );
      }
    };

    const handleRemove = async (value: string) => {
      const { enodeHigh, enodeLow, ip, port } = identifierToParams(value);
      try {
        const est = await nodeRulesContract!.estimate.removeEnode(
          utils.hexlify(enodeHigh),
          utils.hexlify(enodeLow),
          utils.hexlify(ip),
          utils.bigNumberify(port)
        );
        const tx = await nodeRulesContract!.functions.removeEnode(
          utils.hexlify(enodeHigh),
          utils.hexlify(enodeLow),
          utils.hexlify(ip),
          utils.bigNumberify(port),
          {
            gasLimit: est.toNumber() * 2
          }
        );
        toggleModal('remove')(false);
        addTransaction(value, PENDING_REMOVAL);
        await tx.wait(3); // wait on receipt confirmations
        openToast(value, SUCCESS, `Removal of node processed: ${enodeHigh}${enodeLow}`);
        deleteTransaction(value);
      } catch (e) {
        toggleModal('remove')(false);
        updateTransaction(value, FAIL_REMOVAL);
        errorToast(e, value, openToast, () =>
          openToast(
            value,
            FAIL,
            'Could not remove node',
            `${enodeHigh}${enodeLow} was unable to be removed. Please try again.`
          )
        );
      }
    };

    const isDuplicateEnode = (enode: string) => {
      return false; //list.filter((item: Enode) => isEqual(item, enodeToParams(enode))).length > 0;
    };

    const isValid = (enode: string) => {
      if (!isValidEnode(enode)) {
        return {
          valid: false
        };
      } else if (isDuplicateEnode(enode)) {
        return {
          valid: false,
          msg: 'Specified enode is already added.'
        };
      } else {
        return {
          valid: true
        };
      }
    };

    const allDataReady = dataReady && adminDataReady;
    if (isOpen && allDataReady) {
      return (
        <EnodeTab
          list={list}
          modals={modals}
          toggleModal={toggleModal}
          handleAdd={handleAdd}
          handleRemove={handleRemove}
          isAdmin={isAdmin}
          deleteTransaction={deleteTransaction}
          isValid={isValid}
          isReadOnly={isReadOnly!}
          isOpen={isOpen}
        />
      );
    } else if (isOpen && !allDataReady) {
      return <LoadingPage />;
    } else {
      return <div />;
    }
  } else if (isOpen && !nodeRulesContract) {
    return <NoContract tabName="Node Rules" />;
  } else {
    return <div />;
  }
};

EnodeTabContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default EnodeTabContainer;
