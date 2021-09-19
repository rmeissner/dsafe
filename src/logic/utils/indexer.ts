
import { ethers, providers } from 'ethers';
import { EthersLoader, EthersParser, IncomingEthEventSource, IncomingTransferEventSource, ModuleTransactionEventSource, MultisigTransactionEventSource, OutgoingTransferEventSource, SafeIndexer, SafeInteraction, SettingsChangeEventSource } from 'safe-indexer-ts'
import { NetworkConfig } from '../../components/provider/AppSettingsProvider';
import { IndexerState } from '../state/indexer';

export const getIndexer = (safe: string, provider: providers.Provider, networkConfig: NetworkConfig, onNewInteractions: (interactions: SafeInteraction[]) => void): SafeIndexer => {
    const loader = new EthersLoader(provider, [
        new MultisigTransactionEventSource(provider), 
        new ModuleTransactionEventSource(provider), 
        new IncomingTransferEventSource(provider), 
        new OutgoingTransferEventSource(provider), 
        new IncomingEthEventSource(provider), 
        new SettingsChangeEventSource(provider)
    ])
    const parser = new EthersParser(provider)
    const callback = {
        onNewInteractions
    }
    const state = new IndexerState(safe, networkConfig.startingBlock)
    return new SafeIndexer(state, loader, parser, callback, { safe, maxBlocks: networkConfig.maxBlocks, logger: console })
}