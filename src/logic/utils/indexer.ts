
import { providers } from 'ethers';
import { Callback, EthersLoader, EthersParser, IncomingEthEventSource, IncomingTransferEventSource, ModuleTransactionEventSource, MultisigTransactionEventSource, OutgoingTransferEventSource, SafeIndexer, SafeIndexerUserConfig, SettingsChangeEventSource } from 'safe-indexer-ts'
import { NetworkConfig } from '../../components/provider/AppSettingsProvider';
import { IndexerState } from '../state/indexer';
import { Account } from './account';

export const getIndexer = (account: Account, provider: providers.Provider, state: IndexerState, networkConfig: NetworkConfig, callback: Callback): SafeIndexer => {
    const loader = new EthersLoader(provider, [
        new MultisigTransactionEventSource(provider), 
        new ModuleTransactionEventSource(provider), 
        new IncomingTransferEventSource(provider), 
        new OutgoingTransferEventSource(provider), 
        new IncomingEthEventSource(provider), 
        new SettingsChangeEventSource(provider)
    ])
    const parser = new EthersParser(provider)
    const config: SafeIndexerUserConfig = { chainId: account.chainId, safe: account.address, maxBlocks: networkConfig.maxBlocks, logger: console, earliestBlock: state.earliestBlock }
    return new SafeIndexer(state, loader, parser, callback, config)
}