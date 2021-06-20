import { WsProvider, ApiPromise } from '@polkadot/api'

export default class NetworkProvider {
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

  getApi () {
    return this.api
  }
}
