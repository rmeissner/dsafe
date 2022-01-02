import { ethers, PopulatedTransaction } from 'ethers';
import { getFallbackHandlerDeployment, getProxyFactoryDeployment, getSafeL2SingletonDeployment, getSafeSingletonDeployment } from "@gnosis.pm/safe-deployments"
import { AccountInitializerDAO } from '../db/app';
import { Account, buildCaip2Addr, parseAccount } from '../utils/account';

const moduleAddresses: Record<string, string> = {
    "4": "0x5f5f79566FA22FAe06F9B8D63e667B2efdF01d35"
}

export class FactoryRepository {

    db: AccountInitializerDAO

    constructor(readonly provider: ethers.providers.Provider) {
        this.db = new AccountInitializerDAO()
    }

    async availableRelayNetworks(): Promise<string[]> {
        const deployments = getProxyFactoryDeployment()
        if (!deployments || !deployments.networkAddresses) return []
        return Object.keys(deployments?.networkAddresses)
    }

    createSetupInitData(safeContract: ethers.Contract, chainId: string, relaySupport: boolean) {
        if (!relaySupport || !moduleAddresses[chainId]) return {
            to: ethers.constants.AddressZero,
            data: "0x"
        }
        return {
            to: safeContract.address,
            data: safeContract.interface.encodeFunctionData("enabledModule", [moduleAddresses[chainId]])
        }
    }

    async createInitData(chainId: string, signers: string[], threshold: number, nonce: number, relaySupport?: boolean, l2?: boolean): Promise<{ proxyAddress: string, deploymentTx: PopulatedTransaction }> {
        // If not provide use L2 if not on Ethereum Mainnet
        const useL2 = l2 ?? chainId !== "1"
        const singletonDeployment = useL2 ? getSafeL2SingletonDeployment({ network: chainId }) : getSafeSingletonDeployment({ network: chainId })
        if (!singletonDeployment || !singletonDeployment.networkAddresses[chainId]) throw Error("No deployment available")
        const singletonAddress = singletonDeployment.networkAddresses[chainId]

        const proxyFactoryDeployment = getProxyFactoryDeployment({ network: chainId })
        if (!proxyFactoryDeployment || !proxyFactoryDeployment.networkAddresses[chainId]) throw Error("No factory available")
        const proxyFactoryAddress = proxyFactoryDeployment.networkAddresses[chainId]

        const safeContract = new ethers.Contract(singletonAddress, singletonDeployment.abi)
        const fallbackHandlerDeployment = getFallbackHandlerDeployment({ network: chainId })
        const fallbackHandlerAddress = fallbackHandlerDeployment?.networkAddresses?.[chainId] ?? ethers.constants.AddressZero

        const useRelaySupport = relaySupport ?? (await this.availableRelayNetworks()).indexOf(chainId) >= 0
        const { to: initTo, data: initData } = this.createSetupInitData(safeContract, chainId, useRelaySupport)

        const setupData = (await safeContract.populateTransaction.setup(
            signers, threshold, initTo, initData, fallbackHandlerAddress, ethers.constants.AddressZero, 0, ethers.constants.AddressZero
        )).data
        if (!setupData) throw Error("Could not generate setup data")

        const factoryContract = new ethers.Contract(proxyFactoryAddress, proxyFactoryDeployment.abi, this.provider)

        const deploymentTx = await factoryContract.populateTransaction.createProxyWithNonce(
            singletonAddress, setupData, nonce
        )
        const proxyAddress = await factoryContract.callStatic.createProxyWithNonce(
            singletonAddress, setupData, nonce
        )
        return {
            proxyAddress,
            deploymentTx
        }
    }

    async newAccount(chainId: number, signers: string[], threshold: number, nonce: number, relaySupport?: boolean, l2?: boolean): Promise<Account> {
        const initializer = await this.createInitData(chainId.toString(), signers, threshold, nonce, relaySupport, l2)
        const caip2 = buildCaip2Addr(chainId, initializer.proxyAddress)
        const account = parseAccount(caip2)
        if (!account) throw Error("Could not create account")
        await this.db.add({
            ...account,
            initializerTo: initializer.deploymentTx.to!!,
            initializerData: initializer.deploymentTx.data!!
        })
        return account
    }
}