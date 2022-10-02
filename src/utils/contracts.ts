import { getContractInterface, predeploys } from '@vmeta3/contracts'
import { ethers, Contract } from 'ethers'

import { toAddress } from './coercion'
import { DeepPartial } from './type-utils'
import {
  OEContracts,
  OEL1Contracts,
  OEL2Contracts,
  OEContractsLike,
  OEL2ContractsLike,
  AddressLike,
  BridgeAdapters,
  BridgeAdapterData,
  ICrossChainMessenger,
  Chain,
} from '../interfaces'
import {
  StandardBridgeAdapter,
  ETHBridgeAdapter,
  DAIBridgeAdapter,
} from '../adapters'

/**
 * Full list of default L2 contract addresses.
 */
export const DEFAULT_L2_CONTRACT_ADDRESSES: OEL2ContractsLike = {
  L2CrossDomainMessenger: predeploys.L2CrossDomainMessenger,
  L2StandardBridge: predeploys.L2StandardBridge,
  OVM_L1BlockNumber: predeploys.OVM_L1BlockNumber,
  OVM_L2ToL1MessagePasser: predeploys.OVM_L2ToL1MessagePasser,
  OVM_DeployerWhitelist: predeploys.OVM_DeployerWhitelist,
  OVM_ETH: predeploys.OVM_ETH,
  OVM_GasPriceOracle: predeploys.OVM_GasPriceOracle,
  OVM_SequencerFeeVault: predeploys.OVM_SequencerFeeVault,
  WETH: predeploys.WETH9,
}

/**
 * We've changed some contract names in this SDK to be a bit nicer. Here we remap these nicer names
 * back to the original contract names so we can look them up.
 */
const NAME_REMAPPING = {
  AddressManager: 'Lib_AddressManager' as const,
  OVM_L1BlockNumber: 'iOVM_L1BlockNumber' as const,
  WETH: 'WETH9' as const,
}

/**
 * Mapping of L1 chain IDs to the appropriate contract addresses for the OE deployments to the
 * given network. Simplifies the process of getting the correct contract addresses for a given
 * contract name.
 */
export const CONTRACT_ADDRESSES: {
  [l1ChainId: number]: OEContractsLike
} = {
  [Chain.ROPSTEN]: {
    l1: {
      AddressManager: '0xDF460AcBFD9eF9643F63bCAF59dc9430eE69eCDA' as const,
      L1CrossDomainMessenger:
        '0x63C9250c8d38e26E50fEe408f508dc512444604e' as const,
      L1StandardBridge: '0x97f93753460Da366A6ac5Cb93B2C7808b817F2d6' as const,
      StateCommitmentChain:
        '0xe4320c2717D97882bB4B50a3A4e663034Dc4B2C2' as const,
      CanonicalTransactionChain:
        '0x1dB520BcB2D5CA8fd4d32F49b72e69121c7696AF' as const,
      BondManager: '0x0dA8C6aC3072E15908e12B69a33aaD3cc647ACbA' as const,
      VMT: '0xda3870B989b4b1bF94cA79075A57145E1BBdaEFa' as const,
    },
    l2: DEFAULT_L2_CONTRACT_ADDRESSES,
  },
  [Chain.GOERLI]: {
    l1: {
      AddressManager: '0xCa15BF465451e558E61A01982d19c16009CcE073' as const,
      L1CrossDomainMessenger:
        '0x8F11C69B4b0bc46075F35fAd0F59DE273C7C99F2' as const,
      L1StandardBridge: '0xcCE335A319e91c1DDd349a5DAA276D9956C52a24' as const,
      StateCommitmentChain:
        '0x20D8Fcfba4d9B55DD0ccAde19D26BB9e989b49ee' as const,
      CanonicalTransactionChain:
        '0xa8146C03Da4a661e7DeF468faEc64497E404f4Dd' as const,
      BondManager: '0xf3023Ae28B2dED81f2bA19b26cA8121A1d93BD85' as const,
      VMT: '0x7DcC8302D602613CdF8a82bD22d710266441fc23' as const,
    },
    l2: DEFAULT_L2_CONTRACT_ADDRESSES,
  },
  [Chain.KOVAN]: {
    l1: {
      AddressManager: '0xDF460AcBFD9eF9643F63bCAF59dc9430eE69eCDA' as const,
      L1CrossDomainMessenger:
        '0x63C9250c8d38e26E50fEe408f508dc512444604e' as const,
      L1StandardBridge: '0x97f93753460Da366A6ac5Cb93B2C7808b817F2d6' as const,
      StateCommitmentChain:
        '0xe4320c2717D97882bB4B50a3A4e663034Dc4B2C2' as const,
      CanonicalTransactionChain:
        '0x1dB520BcB2D5CA8fd4d32F49b72e69121c7696AF' as const,
      BondManager: '0x0dA8C6aC3072E15908e12B69a33aaD3cc647ACbA' as const,
      VMT: '0x7A73Be9ADDeF779F83d77A642B07c65f4a94f2b7' as const,
    },
    l2: DEFAULT_L2_CONTRACT_ADDRESSES,
  },
  [Chain.HARDHAT_LOCAL]: {
    l1: {
      AddressManager: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const,
      L1CrossDomainMessenger:
        '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318' as const,
      L1StandardBridge: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788' as const,
      StateCommitmentChain:
        '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as const,
      CanonicalTransactionChain:
        '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as const,
      BondManager: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707' as const,
      VMT: '0x0000000000000000000000000000000000000000' as const,
    },
    l2: DEFAULT_L2_CONTRACT_ADDRESSES,
  },
}

/**
 * Mapping of L1 chain IDs to the list of custom bridge addresses for each chain.
 */
export const BRIDGE_ADAPTER_DATA: {
  [l1ChainId: number]: BridgeAdapterData
} = {
  // TODO: Maybe we can pull these automatically from the token list?
  // Alternatively, check against the token list in CI.
  [Chain.ROPSTEN]: {
    Standard: {
      Adapter: StandardBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[Chain.ROPSTEN].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
    ETH: {
      Adapter: ETHBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[Chain.ROPSTEN].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
  },
  [Chain.GOERLI]: {
    Standard: {
      Adapter: StandardBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[Chain.GOERLI].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
    ETH: {
      Adapter: ETHBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[Chain.GOERLI].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
  },
  [Chain.KOVAN]: {
    Standard: {
      Adapter: StandardBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[Chain.KOVAN].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
    ETH: {
      Adapter: ETHBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[Chain.KOVAN].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
  },
  [Chain.HARDHAT_LOCAL]: {
    Standard: {
      Adapter: StandardBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[31337].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
    ETH: {
      Adapter: ETHBridgeAdapter,
      l1Bridge: CONTRACT_ADDRESSES[31337].l1.L1StandardBridge,
      l2Bridge: predeploys.L2StandardBridge,
    },
  },
}

// TODO: PR is big enough as-is, will add support for SNX in another PR
// MAINNET
// l1: {
//   SNX: '0xCd9D4988C0AE61887B075bA77f08cbFAd2b65068',
// },
// l2: {
//   SNX: '0x3f87Ff1de58128eF8FCb4c807eFD776E1aC72E51',
// },
// KOVAN
// l1: {
//   SNX: '0xD134Db47DDF5A6feB245452af17cCAf92ee53D3c',
// },
// l2: {
//   SNX: '0x5C3f51CEd0C2F6157e2be67c029264D6C44bfe42',
// },

/**
 * Returns an ethers.Contract object for the given name, connected to the appropriate address for
 * the given L1 chain ID. Users can also provide a custom address to connect the contract to
 * instead. If the chain ID is not known then the user MUST provide a custom address or this
 * function will throw an error.
 *
 * @param contractName Name of the contract to connect to.
 * @param l1ChainId Chain ID for the L1 network where the OE contracts are deployed.
 * @param opts Additional options for connecting to the contract.
 * @param opts.address Custom address to connect to the contract.
 * @param opts.signerOrProvider Signer or provider to connect to the contract.
 * @returns An ethers.Contract object connected to the appropriate address and interface.
 */
export const getOEContract = (
  contractName: keyof OEL1Contracts | keyof OEL2Contracts,
  l1ChainId: number,
  opts: {
    address?: AddressLike
    signerOrProvider?: ethers.Signer | ethers.providers.Provider
  } = {}
): Contract => {
  const addresses = CONTRACT_ADDRESSES[l1ChainId]
  if (addresses === undefined && opts.address === undefined) {
    throw new Error(
      `cannot get contract ${contractName} for unknown L1 chain ID ${l1ChainId}, you must provide an address`
    )
  }

  return new Contract(
    toAddress(
      opts.address || addresses.l1[contractName] || addresses.l2[contractName]
    ),
    getContractInterface(NAME_REMAPPING[contractName] || contractName),
    opts.signerOrProvider
  )
}

/**
 * Automatically connects to all contract addresses, both L1 and L2, for the given L1 chain ID. The
 * user can provide custom contract address overrides for L1 or L2 contracts. If the given chain ID
 * is not known then the user MUST provide custom contract addresses for ALL L1 contracts or this
 * function will throw an error.
 *
 * @param l1ChainId Chain ID for the L1 network where the OE contracts are deployed.
 * @param opts Additional options for connecting to the contracts.
 * @param opts.l1SignerOrProvider: Signer or provider to connect to the L1 contracts.
 * @param opts.l2SignerOrProvider: Signer or provider to connect to the L2 contracts.
 * @param opts.overrides Custom contract address overrides for L1 or L2 contracts.
 * @returns An object containing ethers.Contract objects connected to the appropriate addresses on
 * both L1 and L2.
 */
export const getAllOEContracts = (
  l1ChainId: number,
  opts: {
    l1SignerOrProvider?: ethers.Signer | ethers.providers.Provider
    l2SignerOrProvider?: ethers.Signer | ethers.providers.Provider
    overrides?: DeepPartial<OEContractsLike>
  } = {}
): OEContracts => {
  const addresses = CONTRACT_ADDRESSES[l1ChainId] || {
    l1: {
      AddressManager: undefined,
      L1CrossDomainMessenger: undefined,
      L1StandardBridge: undefined,
      StateCommitmentChain: undefined,
      CanonicalTransactionChain: undefined,
      BondManager: undefined,
      VMT: undefined,
    },
    l2: DEFAULT_L2_CONTRACT_ADDRESSES,
  }

  // Attach all L1 contracts.
  const l1Contracts = {} as OEL1Contracts
  for (const [contractName, contractAddress] of Object.entries(addresses.l1)) {
    if (contractName == addresses.l1.VMT) {
      continue;
    }
    l1Contracts[contractName] = getOEContract(
      contractName as keyof OEL1Contracts,
      l1ChainId,
      {
        address: opts.overrides?.l1?.[contractName] || contractAddress,
        signerOrProvider: opts.l1SignerOrProvider,
      }
    )
  }

  // Attach all L2 contracts.
  const l2Contracts = {} as OEL2Contracts
  for (const [contractName, contractAddress] of Object.entries(addresses.l2)) {
    l2Contracts[contractName] = getOEContract(
      contractName as keyof OEL2Contracts,
      l1ChainId,
      {
        address: opts.overrides?.l2?.[contractName] || contractAddress,
        signerOrProvider: opts.l2SignerOrProvider,
      }
    )
  }

  return {
    l1: l1Contracts,
    l2: l2Contracts,
  }
}

/**
 * Gets a series of bridge adapters for the given L1 chain ID.
 *
 * @param l1ChainId L1 chain ID for the L1 network where the custom bridges are deployed.
 * @param messenger Cross chain messenger to connect to the bridge adapters
 * @param opts Additional options for connecting to the custom bridges.
 * @param opts.overrides Custom bridge adapters.
 * @returns An object containing all bridge adapters
 */
export const getBridgeAdapters = (
  l1ChainId: number,
  messenger: ICrossChainMessenger,
  opts?: {
    overrides?: BridgeAdapterData
  }
): BridgeAdapters => {
  const adapters: BridgeAdapters = {}
  for (const [bridgeName, bridgeData] of Object.entries({
    ...(BRIDGE_ADAPTER_DATA[l1ChainId] || {}),
    ...(opts?.overrides || {}),
  })) {
    adapters[bridgeName] = new bridgeData.Adapter({
      messenger,
      l1Bridge: bridgeData.l1Bridge,
      l2Bridge: bridgeData.l2Bridge,
    })
  }

  return adapters
}
