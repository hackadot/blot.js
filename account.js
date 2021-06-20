import { web3FromSource } from '@polkadot/extension-dapp'

export default class Account {
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
