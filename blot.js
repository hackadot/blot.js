import {
  web3Enable,
  web3Accounts,
  web3FromSource
} from '@polkadot/extension-dapp'

import { WsProvider, ApiPromise } from '@polkadot/api'
import { ContractPromise, CodePromise, Abi } from '@polkadot/api-contract'

export class Contract {
  constructor (provider, dotContract) {
    this.provider = provider
    const api = this.provider.getApi()
    const wasm = dotContract.source.wasm
    this.abi = new Abi(dotContract, api.registry.getChainProperties())
    this.code = new CodePromise(api, this.abi, wasm)
  }

  // 1000, 'T', 'TT', 0
  // gasLimit: 10000000000,
  //     value: 20000000000
  async deploy (senderAccount, { weight, value }, params, handler) {
    const address = senderAccount.getAddress()
    const signer = await senderAccount.getSigner()
    return this.code.tx[this.abi.constructors[0].method]({
      gasLimit: weight,
      value
    }, ...params).signAndSend(address, { signer }, ({ events = [], status }) => {
      if (handler) {
        handler({ events, status })
      }
      if (status.isInBlock) {
        events.forEach(({ event: { data, method, section } }) => {
          if (section === 'contracts' && method === 'ContractEmitted') {
            this.address = data[0].toHuman()
          }
        })
      }
    })
  }

  getAddress () {
    return this.address
  }

  async call () {
    const api = this.provider.getApi()
    const contract = new ContractPromise(api, this.abi, 'address')
    console.log(contract)
  }
}

export class Account {
  constructor (nativeAccount) {
    this.account = nativeAccount
  }

  getAddress () {
    return this.account.address
  }

  async getSigner () {
    const injector = await web3FromSource(this.account.meta.source)
    return injector.signer
  }
}

export class NetworkProvider {
  constructor (url) {
    this.provider = new WsProvider(url)
  }

  async connect () {
    this.api = await ApiPromise.create({ provider: this.provider })
    return this
  }

  async getBalance (address) {
    const account = await this.api.query.system.account(address)
    return account.data.free
  }

  async transfer (senderAccount, recipientAddress, value, callback) {
    const address = senderAccount.getAddress()
    const signer = await senderAccount.getSigner()
    return this.api.tx.balances
      .transfer(recipientAddress, value)
      .signAndSend(address, { signer }, callback)
  }

  getApi () {
    return this.api
  }
}

export class Blot {
  constructor (provider) {
    this.extensions = []
    this.provider = provider
  }

  async enable (dappName) {
    const beforeEnableTime = Date.now()
    this.extensions = await web3Enable(dappName)
    const afterEnableTime = Date.now()

    if (this.extensions.length === 0) {
      // TRICK: refactoring web3Enable to handle errors correctly is needed
      if (afterEnableTime - beforeEnableTime >= 1000) {
        throw new Error('request rejected by user')
      }
      throw new Error('no extension installed or this page is not allowed to interact with installed extension')
    }
  }

  async getAccounts () {
    return web3Accounts()
  }

  async transfer (senderIndex, recipient, value, callback) {
    const accounts = await web3Accounts()
    const sender = new Account(accounts[senderIndex])

    this.provider.transfer(sender, recipient, value, callback)
  }
}
