import {
  web3Enable,
  web3Accounts
} from '@polkadot/extension-dapp'

import Account from './account.js'
import Interactor from './interactor.js'

export default class Blot {
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

  async getInteractor (accountIndex) {
    const accounts = await web3Accounts()
    const account = new Account(accounts[accountIndex])

    return new Interactor(this.provider, account)
  }
}
