import {
  web3Enable,
  web3Accounts,
  web3FromSource
} from '@polkadot/extension-dapp'

import { WsProvider, ApiPromise } from '@polkadot/api'

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
    this.api.tx.balances
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
