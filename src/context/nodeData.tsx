// Libs
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { NodeRules } from '../chain/@types/NodeRules';
import { nodeRulesFactory } from '../chain/contracts/NodeRules';
import { useNetwork } from './network';
import { ethers } from 'ethers';

// Utils
import {
  paramsToIdentifier,
  paramsToIdentifierTransaction,
  Enode as RawEnode,
  EnodeTransaction as RawEnodeTransaction,
  EnodeApprobe as RawEnodeApprobe
} from '../util/enodetools';

type Enode = RawEnode & { identifier: string };
type EnodeTransacion = RawEnodeTransaction & { identifier: string };
type EnodeApprobe = RawEnodeApprobe & { identifier: string };
type ContextType =
  | {
      nodeList: Enode[];
      nodeTransactionList: EnodeTransacion[];
      nodeApprovedList: EnodeApprobe[];
      setNodeList: React.Dispatch<React.SetStateAction<Enode[]>>;
      setNodeTransactionList: React.Dispatch<React.SetStateAction<EnodeTransacion[]>>;
      setNodeApprovedList: React.Dispatch<React.SetStateAction<EnodeApprobe[]>>;

      nodeReadOnly?: boolean;
      setNodeReadOnly: React.Dispatch<React.SetStateAction<boolean | undefined>>;
      nodeRulesContract?: NodeRules;
      setNodeRulesContract: React.Dispatch<React.SetStateAction<NodeRules | undefined>>;
    }
  | undefined;

const DataContext = createContext<ContextType>(undefined);
const AbiCoder = ethers.utils.defaultAbiCoder;
const HOST = process.env.REACT_APP_HOST_BACK_OFFICE;
var isAdmin: boolean;

const loadNodesApproved = (setNodeApprovedList: (node: EnodeApprobe[]) => void) => {
  let accessToken = process.env.REACT_APP_TOKEN_BACK_OFFICE;
  let networkId = process.env.REACT_APP_CHAIN_ID;
  console.log(networkId);
  const url = HOST + '/node?status=APPROVED&networkId=' + networkId;
  console.log('url', url);
  const params = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
  console.log(url);
  const fetchPromise = fetch(url, params);
  fetchPromise
    .then(response => {
      console.log('response:', response);
      if (response.status == 200) {
        return response.json();
      } else {
        return null;
      }
    })
    .then(nodes => {
      if (nodes) {
        console.log('nodes:', nodes);
        const approveddNodeList = nodes.map((node: any) => {
          let enode = 'enode://' + node.enode.substring(2) + '@' + node.ipAddress + ':' + node.portp2p;

          return {
            id: node._id,
            nodeType: node.type,
            name: node.nodeNameEthstats,
            organization: node.entity,
            enode: 'enode://' + node.enode.substring(2) + '@' + node.ipAddress + ':' + node.portp2p
          };
        });

        setNodeApprovedList(approveddNodeList);
      } else {
        console.log('no nodes');
        setNodeApprovedList([]);
      }
    })
    .catch(error => {
      console.error(error);
    });
  //APPROVED
};
const loadNodeData = (
  nodeRulesContract: NodeRules | undefined,

  setNodeList: (node: Enode[]) => void,
  setNodeTransactionList: (node: EnodeTransacion[]) => void,

  setNodeReadOnly: (readOnly?: boolean) => void
) => {
  console.log('loadNodeData');
  if (nodeRulesContract === undefined) {
    setNodeList([]);
    setNodeTransactionList([]);
    setNodeReadOnly(undefined);
  } else {
    nodeRulesContract.functions.isReadOnly().then(isReadOnly => setNodeReadOnly(isReadOnly));

    nodeRulesContract.functions.getSize().then(listSize => {
      const listElementPromises = [];
      for (let i = 0; listSize.gt(i); i++) {
        listElementPromises.push(nodeRulesContract.functions.getByIndex(i));
      }
      Promise.all(listElementPromises).then(responses => {
        const updatedNodeList = responses.map(r => {
          const withStringyPort = { ...r, port: r.port.toString() };
          return {
            ...withStringyPort,
            identifier: paramsToIdentifier(withStringyPort)
          };
        });
        setNodeList(updatedNodeList);
      });
    });

    nodeRulesContract.functions.getTransactionCount(true, false).then(countTransaction => {
      // console.log("countTransaction:"+countTransaction)
      nodeRulesContract.functions.getTransactionIds(0, countTransaction, true, false).then(listTransaction => {
        const listElementsPromisesTransaction = [];

        for (let i = 0; i < listTransaction.length; i++) {
          console.log(listTransaction[i].toNumber());
          if (listTransaction[i].toNumber() >= 0) {
            console.log('id-transacion-' + listTransaction[i]);
            listElementsPromisesTransaction.push(nodeRulesContract.functions.getTransaction(listTransaction[i]));
          }
        }

        Promise.all(listElementsPromisesTransaction).then(responses => {
          const updatedNodeList = responses.map(r => {
            const payload = r[0];
            const executed = r[1];
            const transactionID = r[2];
            const nameFunc = payload.slice(2, 10);
            console.log(nameFunc); //"73ac6f8f"
            let withStringyPort = {
              enodeHigh: '',
              enodeLow: '',
              ip: '',
              port: '',
              nodeType: 4,
              geoHash: '',
              organization: '',
              name: '',
              did: '',
              group: '',
              executed: executed,
              transactionId: transactionID.toNumber()
            };

            if (nameFunc === '2444b823') {
              //remove
              const decode = AbiCoder.decode(
                ['bytes32', 'bytes32', 'bytes16', 'uint16'],
                '0x' + payload.slice(10, payload.length)
              );
              withStringyPort = {
                enodeHigh: decode[0],
                enodeLow: decode[1],
                ip: decode[2],
                port: decode[3].toString(),
                nodeType: 4,
                geoHash: '',
                organization: '',
                name: '',
                did: '',
                group: '',
                executed: executed,
                transactionId: transactionID.toNumber()
              };
            } else if (nameFunc === 'afe76f5c') {
              const decode = AbiCoder.decode(
                ['bytes32', 'bytes32', 'bytes16', 'uint16', 'uint8', 'bytes6', 'string', 'string', 'string', 'bytes32'],
                '0x' + payload.slice(10, payload.length)
              );
              withStringyPort = {
                enodeHigh: decode[0],
                enodeLow: decode[1],
                ip: decode[2],
                port: decode[3].toString(),
                nodeType: decode[4],
                geoHash: decode[5],
                name: decode[6],
                organization: decode[7],
                did: decode[8],
                group: decode[9],
                executed: executed,
                transactionId: transactionID.toNumber()
              };
            }
            return {
              ...withStringyPort,
              identifier: paramsToIdentifierTransaction(withStringyPort)
            };
          });

          setNodeTransactionList(updatedNodeList);
        });
      });
    });
  }
};

/**
 * Provider for the data context that contains the node list
 * @param {Object} props Props given to the NodeDataProvider
 * @return The provider with the following value:
 *  - nodeList: list of whiteliist enode from Node Rules contract
 *  - setNodeList: setter for the list state
 */
export const NodeDataProvider: React.FC<{}> = props => {
  const [nodeList, setNodeList] = useState<Enode[]>([]);
  const [nodeTransactionList, setNodeTransactionList] = useState<EnodeTransacion[]>([]);
  const [nodeApprovedList, setNodeApprovedList] = useState<EnodeApprobe[]>([]);

  const [nodeReadOnly, setNodeReadOnly] = useState<boolean | undefined>(undefined);
  const [nodeRulesContract, setNodeRulesContract] = useState<NodeRules | undefined>(undefined);

  const value = useMemo(
    () => ({
      nodeList,
      setNodeList,
      nodeTransactionList,
      nodeApprovedList,
      setNodeTransactionList,
      setNodeApprovedList,
      nodeReadOnly,
      setNodeReadOnly,
      nodeRulesContract,
      setNodeRulesContract
    }),
    [
      nodeList,
      setNodeList,
      nodeTransactionList,
      nodeApprovedList,
      setNodeTransactionList,
      setNodeApprovedList,
      nodeReadOnly,
      setNodeReadOnly,
      nodeRulesContract,
      setNodeRulesContract
    ]
  );

  const { nodeIngressContract } = useNetwork();

  useEffect(() => {
    if (nodeIngressContract === undefined) {
      setNodeRulesContract(undefined);
    } else {
      nodeRulesFactory(nodeIngressContract).then(contract => {
        setNodeRulesContract(contract);

        contract.removeAllListeners('TransactionAdded');
        contract.removeAllListeners('NodeRemoved');
        contract.removeAllListeners('Confirmation');
        contract.removeAllListeners('Revocation');

        contract.on('TransactionAdded', () => {
          console.log('TransactionAdded');
          loadNodeData(contract, setNodeList, setNodeTransactionList, setNodeReadOnly);
          setTimeout(() => {
            isAdmin && loadNodesApproved(setNodeApprovedList);
          }, 3000);
        });
        contract.on('NodeRemoved', () => {
          console.log('NodeRemoved');
          loadNodeData(contract, setNodeList, setNodeTransactionList, setNodeReadOnly);
          isAdmin && loadNodesApproved(setNodeApprovedList);
        });
        contract.on('Confirmation', () => {
          console.log('Confirmation');
          loadNodeData(contract, setNodeList, setNodeTransactionList, setNodeReadOnly);
          setTimeout(() => {
            isAdmin && loadNodesApproved(setNodeApprovedList);
          }, 3000);
        });
        contract.on('Revocation', () => {
          console.log('Revocation');
          loadNodeData(contract, setNodeList, setNodeTransactionList, setNodeReadOnly);
          isAdmin && loadNodesApproved(setNodeApprovedList);
        });
      });
    }
  }, [nodeIngressContract]);

  return <DataContext.Provider value={value} {...props} />;
};

/**
 * Fetch the appropriate node data on chain and synchronize with it
 * @return {Object} Contains data of interest:
 *  - dataReady: true if isReadOnly and node allowlist are correctly fetched,
 *  false otherwise
 *  - userAddress: Address of the user
 *  - isReadOnly: Node contract is lock or unlock,
 *  - allowlist: list of permitted nodes from Node contract,
 */
export const useNodeData = (_isAdmin: boolean) => {
  isAdmin = _isAdmin;

  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useNodeData must be used within a NodeDataProvider.');
  }

  const {
    nodeList,
    setNodeList,
    nodeTransactionList,
    setNodeTransactionList,
    nodeApprovedList,
    setNodeApprovedList,
    nodeReadOnly,
    setNodeReadOnly,
    nodeRulesContract
  } = context;

  useEffect(() => {
    setTimeout(() => {
      isAdmin && loadNodesApproved(setNodeApprovedList);
      loadNodeData(nodeRulesContract, setNodeList, setNodeTransactionList, setNodeReadOnly);
    }, 3000);
  }, [nodeRulesContract, setNodeList, setNodeTransactionList, setNodeReadOnly]);

  const formattedNodeList = useMemo(() => {
    return nodeList.map(enode => ({ ...enode, status: 'active' })).reverse();
  }, [nodeList]);

  const formattedNodeTransactionList = useMemo(() => {
    return nodeTransactionList
      .map(enode => ({ ...enode, status: enode.executed ? 'active' : 'pendingAddition' }))
      .reverse();
  }, [nodeTransactionList]);

  const dataReady = useMemo(() => {
    return (
      nodeRulesContract !== undefined &&
      nodeReadOnly !== undefined &&
      nodeList !== undefined &&
      nodeTransactionList !== undefined
    );
  }, [nodeRulesContract, nodeReadOnly, nodeList, nodeTransactionList]);

  return {
    dataReady,
    allowlist: formattedNodeList,
    allowApprovedlist: nodeApprovedList,
    allowlistTransacion: formattedNodeTransactionList,
    isReadOnly: nodeReadOnly,
    nodeRulesContract
  };
};
