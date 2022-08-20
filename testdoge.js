const bip39 = require('bip39')
const bs58 = require('bs58')


const address = 'cjQAEe9SyZvCx9jnGDkVbQ3b18DY6hX7wAE467rzaSiNv3vyxo5u'
const bytes = bs58.decode(address)
first_encode = Buffer.from(bytes).toString('hex')
private_key_full = first_encode.slice(2,-10)
console.log(private_key_full.length)
console.log(private_key_full)
const mnemonic = bip39.entropyToMnemonic(private_key_full)
console.log(mnemonic.split(" "))
