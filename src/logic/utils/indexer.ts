
import { ethers, providers } from 'ethers';
import { EthersLoader, EthersParser, ModuleTransactionEventSource, MultisigTransactionEventSource, SafeIndexer, SafeInteraction } from 'safe-indexer-ts'
import { IndexerState } from '../state/indexer';

export const getIndexer = (safe: string, provider: providers.Provider, onNewInteractions: (interactions: SafeInteraction[]) => void): SafeIndexer => {
    const loader = new EthersLoader(provider, [new MultisigTransactionEventSource(provider), new ModuleTransactionEventSource(provider)])
    const parser = new EthersParser(provider)
    const callback = {
        onNewInteractions
    }
    const state = new IndexerState(safe, 5590754)
    return new SafeIndexer(state, loader, parser, callback, { safe, maxBlocks: 100000, logger: console })
}