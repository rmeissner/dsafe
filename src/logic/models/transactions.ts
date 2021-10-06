import { SafeSignatureType } from "../utils/signatures";

export interface MetaTransaction {
    to: string,
    value: string,
    data: string,
    operation: number,
}

export interface SafeTransaction extends MetaTransaction {
    safeTxGas: string,
    baseGas: string,
    gasPrice: string,
    gasToken: string,
    refundReceiver: string,
    nonce: number
}

export interface SignedSafeTransaction extends SafeTransaction {
    signatures: string
}

export interface SafeTransactionSignature {
    id: string,
    type: SafeSignatureType,
    signer: string,
    data: string,
    safeTxHash: string,
}