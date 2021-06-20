import Contract from './contract.js'

export default class Interactor {
  constructor (provider, account) {
    this.provider = provider
    this.account = account
  }

  async transfer (recipientAddress, value, callback) {
    const address = this.account.getAddress()
    const signer = await this.account.getSigner()
    const api = this.provider.getApi()
    return api.tx.balances
      .transfer(recipientAddress, value)
      .signAndSend(address, { signer }, callback)
  }

  async getBalance () {
    return this.provider.getBalance(this.account.getAddress())
  }

  getAddress () {
    return this.account.getAddress()
  }

  newContract (dotContract) {
    return new Contract(this.provider, this.account, dotContract)
  }
}
