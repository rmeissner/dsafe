import { ethers, PopulatedTransaction, Signer } from 'ethers';
import { getFallbackHandlerDeployment, getProxyFactoryDeployment, getSafeL2SingletonDeployment, getSafeSingletonDeployment } from "@gnosis.pm/safe-deployments"
import { buildMultiSend } from '../utils/proposing';

const moduleAddresses: Record<string, string> = {
    "4": "0x5f5f79566FA22FAe06F9B8D63e667B2efdF01d35"
}

export class FactoryRepository {

    async availableNetworks(): Promise<string[]> {
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
            to: ethers.constants.AddressZero,
            data: "0x" 
        }
    }

    async createInitData(chainId: string, signers: string[], threshold: number, nonce: number, relaySupport: boolean, l2?: boolean): Promise<PopulatedTransaction> {
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

        const { to: initTo, data: initData } = this.createSetupInitData(safeContract, chainId, relaySupport)

        const setupData = (await safeContract.populateTransaction.setup(
            signers, threshold, initTo, initData, fallbackHandlerAddress, ethers.constants.AddressZero, 0, ethers.constants.AddressZero
        )).data
        if (!setupData) throw Error("Could not generate setup data")

        const factoryContract = new ethers.Contract(proxyFactoryAddress, proxyFactoryDeployment.abi)
        return factoryContract.populateTransaction.createProxyWithNonce(
            singletonAddress, setupData, nonce
        )
    }
}