import { ContractPromise, CodePromise, Abi } from '@polkadot/api-contract'

class ERC20 {
  constructor (provider, abi, address) {
    this.contract = new ContractPromise(provider.getApi(), abi, address)
    this.options = {
      value: 0,
      gasLimit: 300000n * 1000000n
    }
  }

  async tokenName () {
    const { result } = await this.contract.query['iErc20,tokenName'](null, this.options)
    return result.asOk.data.toUtf8()
  }

  async tokenSymbol () {
    const { result } = await this.contract.query['iErc20,tokenSymbol'](null, this.options)
    return result.asOk.data.toUtf8()
  }
}

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

  assumeERC20 () {
    return new ERC20(this.provider, this.abi, this.address)
  }

  async call () {
    const api = this.provider.getApi()
    const contract = new ContractPromise(api, this.abi, this.address)
    const value = 0
    const gasLimit = 300000n * 1000000n
    const { gasConsumed, result } = await contract.query['iErc20,tokenName'](null, { gasLimit, value })
    // console.log(contract.query)

    console.log(result.toHuman())

    console.log(gasConsumed.toHuman())
  }
}
