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
    nonce: string
}