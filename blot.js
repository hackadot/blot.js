import {
  web3Enable,
  web3Accounts,
  isWeb3Injected
} from '@polkadot/extension-dapp'

import { WsProvider, ApiPromise } from '@polkadot/api'

export class Account {
  constructor (nativeAccount) {
    this.nativeAccount = nativeAccount
  }

  getAddress () {
    return this.nativeAccount
  }
}

export class NetworkProvider {
  constructor (url) {
    this.provider = new WsProvider(url)
  }

  async init () {
    this.api = await ApiPromise.create({ provider: this.provider })
    return this
  }

  async getBalance (address) {
    const account = await this.api.query.system.account(address)
    return account.data.free
  }
}

export class Blot {
  constructor () {
    this.extensions = []
  }

  async enable (dappName) {
    const extensions = isWeb3Injected
    console.log(extensions)

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
}
