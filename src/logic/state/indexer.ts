import { State } from "safe-indexer-ts";

export class IndexerState implements State {
    safe: string;
    defaultBlock: number;
    _lastIndexedBlock: number; // 8485873 is the Block of initial 1.3.0 deployment

    constructor(safe: string, defaultBlock: number) {
        this.safe = safe;
        this.defaultBlock = defaultBlock;
        const storedBlock = localStorage.getItem("indexer_state_safe_" + this.safe);
        this._lastIndexedBlock = storedBlock ? parseInt(storedBlock) : defaultBlock;
    }

    set lastIndexedBlock(value: number) {
        localStorage.setItem("indexer_state_safe_" + this.safe, value.toString())
        this._lastIndexedBlock = value;
    }
    get lastIndexedBlock() {
        return this._lastIndexedBlock
    }

    reset() {
        localStorage.removeItem("indexer_state_safe_" + this.safe)
        this._lastIndexedBlock = this.defaultBlock
    }
}