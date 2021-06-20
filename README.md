```js
const provider = await new NetworkProvider('ws://127.0.0.1:9944').connect()
const blot = new Blot(provider)
await blot.enable('Hackathon Token');

// INTERACTOR CREATION -------------------------------------------------------------------
const interactor = await blot.getInteractor(0) // index of account here
console.log(interactor.getAddress(), (await interactor.getBalance()).toHuman())

// TRANSFER EXAMPLE ----------------------------------------------------------------------
const allAccounts = await blot.getAccounts();
await interactor.transfer(allAccounts[1].address, 1, ({ status }) => {
  console.log('Transaction status:', status.type)
  if (status.isInBlock) {
    console.log('Included at block hash', status.asInBlock.toHex())
  }
})

// CONTRACT DEPLOYMENT -------------------------------------------------------------------
const contract = interactor.newContract(dotContract)
const options = { weight: 10000000000, value: 20000000000 }
await contract.deploy([200, 'Hackathon Token', 'HACK', 0], options,({ status }) => {
  console.log('Transaction status:', status.type)
  if (status.isInBlock) {
    console.log('Included at block hash', status.asInBlock.toHex())
  }
})

// CONTRACT CALLS -------------------------------------------------------------------
alert(`contract address ${contract.getAddress()}`)

const erc20 = contract.assumeERC20()

const tokenName = await erc20.tokenName()
alert(`TOKEN NAME: ${tokenName}`)
const tokenSymbol = await erc20.tokenSymbol()
alert(`TOKEN SYMBOL: ${tokenSymbol}`)
```