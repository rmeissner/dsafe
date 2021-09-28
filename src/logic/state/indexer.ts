import { State } from "safe-indexer-ts";

export class IndexerState implements State {
    safe: string;
    defaultBlock: number;
    private _lastIndexedBlock: number;
    private _earliestIndexedBlock: number; // 8485873 is the Block of initial 1.3.0 deployment
    private _earliestBlock: number;

    constructor(safe: string, defaultBlock?: number) {
        this.safe = safe;
        this.defaultBlock = defaultBlock || -1;
        const storedEarliestIndexedBlock = localStorage.getItem("indexer_state_safe_earliest_indexed_block" + this.safe);
        this._earliestIndexedBlock = storedEarliestIndexedBlock ? parseInt(storedEarliestIndexedBlock) : this.defaultBlock;
        const storedLastIndexedBlock = localStorage.getItem("indexer_state_safe_last_indexed_block" + this.safe);
        this._lastIndexedBlock = storedLastIndexedBlock ? parseInt(storedLastIndexedBlock) : this.defaultBlock;
        const storedEarliestBlock = localStorage.getItem("indexer_state_safe_earliest_block" + this.safe);
        this._earliestBlock = storedEarliestBlock ? parseInt(storedEarliestBlock) : 0;
    }

    set lastIndexedBlock(value: number) {
        localStorage.setItem("indexer_state_safe_last_indexed_block" + this.safe, value.toString())
        this._lastIndexedBlock = value;
    }
    get lastIndexedBlock() {
        return this._lastIndexedBlock
    }

    set earliestIndexedBlock(value: number) {
        localStorage.setItem("indexer_state_safe_earliest_indexed_block" + this.safe, value.toString())
        this._earliestIndexedBlock = value;
    }
    get earliestIndexedBlock() {
        return this._earliestIndexedBlock
    }

    set earliestBlock(value: number) {
        localStorage.setItem("indexer_state_safe_earliest_block" + this.safe, value.toString())
        this._earliestBlock = value;
    }
    get earliestBlock() {
        return this._earliestBlock
    }

    reset() {
        localStorage.removeItem("indexer_state_safe_earliest_indexed_block" + this.safe)
        localStorage.removeItem("indexer_state_safe_last_indexed_block" + this.safe)
        localStorage.removeItem("indexer_state_safe_earliest_block" + this.safe)
        this._lastIndexedBlock = this.defaultBlock
        this._earliestIndexedBlock = this.defaultBlock
    }
}