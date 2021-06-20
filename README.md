```js
const provider = await new NetworkProvider('ws://127.0.0.1:9944').connect()
const blot = new Blot(provider)

try {
  await blot.enable('Hackathon Token');
  const interactor = await blot.getInteractor(0) // index of account here
  console.log(interactor.getAddress(), (await interactor.getBalance()).toHuman())

  const allAccounts = await blot.getAccounts();
  await interactor.transfer(allAccounts[1].address, 1, ({ status }) => {
    console.log('Transaction status:', status.type)
    if (status.isInBlock) {
      console.log('Included at block hash', status.asInBlock.toHex())
    }
  })

  const contract = interactor.newContract(dotContract)
  await contract.deploy([200, 'Hackathon Token', 'HACK', 0], { weight: 10000000000, value: 20000000000 },({ events = [], status }) => {
    console.log('Transaction status:', status.type)

    if (status.isInBlock) {
      console.log('Included at block hash', status.asInBlock.toHex())
      console.log('Events:')

      events.forEach(({ event: { data, method, section }, phase }) => {
        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString())
      })
    } else if (status.isFinalized) {
      console.log('Finalized block hash', status.asFinalized.toHex())
    }
  })
  setTimeout(() => {
    console.log('contract address', contract.getAddress())
  }, 1000)

} catch (err) {
  console.warn(err)
}
```