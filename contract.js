import { ContractPromise, CodePromise, Abi } from '@polkadot/api-contract'

export default class Contract {
  constructor (provider, account, dotContract) {
    this.provider = provider
    this.account = account
    const api = this.provider.getApi()
    const wasm = dotContract.source.wasm
    this.abi = new Abi(dotContract, api.registry.getChainProperties())
    this.code = new CodePromise(api, this.abi, wasm)
  }

  async deploy (params, { weight, value }, handler) {
    const address = this.account.getAddress()
    const signer = await this.account.getSigner()
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
