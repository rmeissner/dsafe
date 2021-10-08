import { BigNumber } from "@ethersproject/bignumber"
import { utils } from "ethers";
import { MetaTransaction } from "../models/transactions"
import { getMultiSendDeployment } from "@gnosis.pm/safe-deployments"
import { Account } from "./account";

export const removeHexPrefix = (input: string) => input.toLowerCase().startsWith("0x") ? input.slice(2) : input;

const encodeData = (operation: number, to: string, value: string, data: string) => {
    let dataBuffer = Buffer.from(removeHexPrefix(data), "hex")
    return removeHexPrefix(utils.solidityPack(
        ["uint8", "address", "uint256", "uint256", "bytes"],
        [operation, to, BigNumber.from(value).toHexString(), dataBuffer.length, dataBuffer]
    ))
}

export const buildMultiSend = (transactions: MetaTransaction[], chainId: number): MetaTransaction => {
    const network = chainId.toString()
    const multiSendDeployment = getMultiSendDeployment({ network })
    if (!multiSendDeployment) throw Error("MultiSend not available on this network")
    const multiSendInterface = new utils.Interface(multiSendDeployment.abi)
    let multiSendBytes = "0x"
    for (let transaction of transactions) {
        multiSendBytes += encodeData(0, transaction.to, transaction.value, transaction.data)
    }
    const multiSendData = multiSendInterface.encodeFunctionData("multiSend", [multiSendBytes])
    return {
        to: multiSendDeployment.networkAddresses[network],
        value: "0x00",
        data: multiSendData,
        operation: 1
    }
}


export const buildTx = (account: Account, transactions?: MetaTransaction[]): MetaTransaction => {
    if (!transactions || transactions.length === 0) {
        return {
            to: "",
            value: "",
            data: "",
            operation: 0
        }
    }
    if (transactions.length === 1) {
        return transactions[0]
    }
    return buildMultiSend(transactions, account.chainId)
}