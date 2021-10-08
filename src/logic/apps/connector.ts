import {
    getSDKVersion,
    SDKMessageEvent,
    MethodToResponse,
    Methods,
    SafeInfo,
    MessageFormatter,
    RequestId,
    BaseTransaction,
    RPCPayload
} from '@gnosis.pm/safe-apps-sdk'
import {
    providers
} from 'ethers'
import { Account } from '../utils/account'

export interface MessageHandlers {
    onTransactionProposal: (transactions: BaseTransaction[], requestId: RequestId) => void
}

export class FrameCommunicator {
    provider?: providers.JsonRpcProvider
    constructor(
        readonly frame: React.RefObject<HTMLIFrameElement>,
        readonly appUrl: string,
        readonly info: Account,
        readonly handlers: MessageHandlers
    ) { }

    handleMessage(
        method: Methods,
        params: unknown,
        requestId: RequestId
    ) {
        if (!method) {
            console.error('ThirdPartyApp: A message was received without message id.')
            return
        }
        console.log(`Received ${method} with ${JSON.stringify(params)}`)

        switch (method) {
            case 'sendTransactions': {
                if (params) {
                    this.handlers.onTransactionProposal(
                        // @ts-expect-error explore ways to fix this
                        params.txs as Transaction[],
                        requestId,
                    )
                }
                break
            }

            case 'getSafeInfo': {
                this.sendResponse({
                    safeAddress: this.info.address,
                    chainId: this.info.chainId
                }, requestId)
                break
            }

            case 'rpcCall': {
                const payload = params as RPCPayload
                const communicator = this
                try {
                    this.provider!!.send(payload.call, payload.params).then(
                        (resp: any) => {
                            communicator.sendResponse(resp, requestId)
                        }, (err: any) => {
                            communicator.sendError(err, requestId)
                        }
                    )
                } catch (err: any) {
                    communicator.sendError(err.toString(), requestId)
                }
                break
            }

            default: {
                console.error(`ThirdPartyApp: A message was received with an unknown method ${method}.`)
                this.sendError(`Unknown method ${method}.`, requestId)
                break
            }
        }
    }

    onMessage(message: SDKMessageEvent) {
        if (message.source === window) {
            return
        }
        if (!this.appUrl.includes(message.origin)) {
            console.error(`ThirdPartyApp: A message was received from an unknown origin ${message.origin}`)
            return
        }
        this.handleMessage(message.data.method, message.data.params, message.data.id)
    }

    sendResponse(
        data: MethodToResponse[Methods],
        requestId: RequestId
    ) {
        const frameWindow = this.frame.current?.contentWindow
        if (!frameWindow) return
        const sdkVersion = getSDKVersion()
        const msg = MessageFormatter.makeResponse(requestId, data, sdkVersion)
        frameWindow.postMessage(msg, this.appUrl)
    }

    sendError(
        error: string,
        requestId: RequestId
    ) {
        const frameWindow = this.frame.current?.contentWindow
        if (!frameWindow) return
        const sdkVersion = getSDKVersion()
        const msg = MessageFormatter.makeErrorResponse(requestId, error, sdkVersion)
        frameWindow.postMessage(msg, this.appUrl)
    }

    connect(defaultWindow?: Window): (() => void) | undefined {
        const eventWindow = defaultWindow || this.frame.current?.contentWindow
        if (!eventWindow) return
        const callback = (ev: MessageEvent<any>) => { this.onMessage(ev) }
        eventWindow.addEventListener('message', callback)
        return () => {
            eventWindow.removeEventListener('message', callback)
        }
    }
}