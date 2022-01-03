import { Contract, PopulatedTransaction } from "@ethersproject/contracts";
import { safeInterface, SignedSafeTransaction } from "safe-indexer-ts";
import { ethers, BigNumber, Signer } from "ethers";
import { SafeTransaction } from "../models/transactions";
import { AccountInitializer } from "../db/app";
import { _TypedDataEncoder } from "ethers/lib/utils";
import { getEIP712Domain, getEIP712TxType } from "./signatures";

export interface SafeStatus {
    nonce: BigNumber,
    threshold: BigNumber,
    owners: string[],
    version: string
}

export interface Safe {
    owners(): Promise<string[]>
    nonce(): Promise<BigNumber>
    status(): Promise<SafeStatus>
    getTransactionHash(tx: SafeTransaction): Promise<{ hash: string, version: string }>
    populateTx(tx: SignedSafeTransaction): Promise<PopulatedTransaction>
    writable(signer: Signer): WritableSafe
}

export interface WritableSafe extends Safe {
    executeTx(tx: SignedSafeTransaction): Promise<string>
}

export class CounterfactualSafe implements Safe {
    protected readonly safeContract: Contract

    constructor(readonly initializer: AccountInitializer) {
        this.safeContract = new Contract(initializer.address, safeInterface)
    }

    async owners(): Promise<string[]> {
        return this.initializer.signers
    }

    async nonce(): Promise<BigNumber> {
        return BigNumber.from(0)
    }

    async status(): Promise<SafeStatus> {
        return {
            nonce: BigNumber.from(0),
            threshold: BigNumber.from(this.initializer.threshold),
            owners: this.initializer.signers,
            version: this.initializer.version
        }
    }

    async getTransactionHash(tx: SafeTransaction): Promise<{ hash: string, version: string }> {
        const hash = _TypedDataEncoder.encode(
            getEIP712Domain(this.initializer.version, this.initializer),
            getEIP712TxType(this.initializer.version),
            tx
        )
        return {
            hash,
            version: this.initializer.version
        }
    }

    populateTx(tx: SignedSafeTransaction): Promise<PopulatedTransaction> {
        return this.safeContract.populateTransaction.execTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.safeTxGas,
            tx.baseGas,
            tx.gasPrice,
            tx.gasToken,
            tx.refundReceiver,
            tx.signatures
        )
    }

    writable(signer: Signer): WritableSafe {
        return new WritableDeployedSafe(this.safeContract.address, signer)
    }
}

export class DeployedSafe implements Safe {
    protected readonly safeContract: Contract

    constructor(address: string, providerOrSigner?: ethers.providers.Provider | Signer) {
        this.safeContract = new Contract(address, safeInterface, providerOrSigner)
    }

    nonce(): Promise<BigNumber> {
        return this.safeContract.nonce()
    }

    owners(): Promise<string[]> {
        return this.safeContract.getOwners()
    }

    async status(): Promise<SafeStatus> {
        const information = await Promise.all([
            this.safeContract.nonce(),
            this.safeContract.getThreshold(),
            this.safeContract.getOwners(),
            this.safeContract.VERSION(),
        ])
        return {
            nonce: information[0],
            threshold: information[1],
            owners: information[2],
            version: information[3]
        }
    }

    async getTransactionHash(tx: SafeTransaction): Promise<{ hash: string, version: string }> {
        const hash: string = await this.safeContract.getTransactionHash(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.safeTxGas,
            tx.baseGas,
            tx.gasPrice,
            tx.gasToken,
            tx.refundReceiver,
            tx.nonce
        )
        const version: string = await this.safeContract.VERSION()
        return { hash, version }
    }

    populateTx(tx: SignedSafeTransaction): Promise<PopulatedTransaction> {
        return this.safeContract.populateTransaction.execTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.safeTxGas,
            tx.baseGas,
            tx.gasPrice,
            tx.gasToken,
            tx.refundReceiver,
            tx.signatures
        )
    }

    writable(signer: Signer): WritableSafe {
        return new WritableDeployedSafe(this.safeContract.address, signer)
    }
}

export class WritableDeployedSafe extends DeployedSafe implements WritableSafe {
    constructor(address: string, signer: Signer) {
        super(address, signer)
    }

    executeTx(tx: SignedSafeTransaction): Promise<string> {
        return this.safeContract.execTransaction(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.safeTxGas,
            tx.baseGas,
            tx.gasPrice,
            tx.gasToken,
            tx.refundReceiver,
            tx.signatures
        )
    }
}