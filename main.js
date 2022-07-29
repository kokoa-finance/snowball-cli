const { ethers } = require('ethers')
const { ArgumentParser } = require('argparse')
const fs = require('fs')

const deployments = {
  Helper: JSON.parse(fs.readFileSync('./abi/Helper.json')),
  Round: JSON.parse(fs.readFileSync('./abi/Round.json')),
  KIP7: JSON.parse(fs.readFileSync('./abi/KIP7.json')),
}

const parser = new ArgumentParser({
  description: 'Arguments for buying ticket bot',
})
parser.add_argument('--id', {
  dest: 'id',
  required: true,
  type: 'int',
  help: 'Round index',
})
parser.add_argument('--private_key', {
  dest: 'private_key',
  required: true,
  type: 'str',
  help: 'private key of address',
})
parser.add_argument('--rpc', {
  dest: 'rpc',
  type: 'str',
  default: 'https://public-node-api.klaytnapi.com/v1/cypress',
  help: 'endpoint url of rpc node',
})
parser.add_argument('--helper', {
  dest: 'helper',
  type: 'str',
  default: '0x55968Ab82db96407f567D1e2f46157E68fd92F73',
  help: 'address of Helper',
})
parser.add_argument('--referent', {
  dest: 'referent',
  type: 'str',
  default: '0x0000000000000000000000000000000000000000',
  help: 'referent address if there is no referent, a null address is entered',
})
parser.add_argument('--use_aklay', {
  dest: 'use_aklay',
  action: 'store_true',
  help: 'if `true`, user buy ticket using klay else using aklay',
})
let args = parser.parse_args()
const provider = new ethers.providers.JsonRpcProvider(args.rpc)
const wallet = new ethers.Wallet(args.private_key, provider)

const getAKlay = async () => {
  return new ethers.Contract(
    '0x74BA03198FEd2b15a51AF242b9c63Faf3C8f4D34',
    deployments.KIP7,
    provider,
  )
}

const main = async () => {
  const Helper = new ethers.Contract(args.helper, deployments.Helper, provider)
  const [roundStatus, userStatus] = await Promise.all([
    Helper.getRoundStatus(args.id, '0'),
    Helper.getUserParticipationStatus(args.id, wallet.address, args.referent),
  ])
  const Round = new ethers.Contract(
    roundStatus.round,
    deployments.Round,
    provider,
  )
  let overrides = {
    gasPrice: 250000000000,
    gasLimit: 2000000,
    value: 0,
  }
  if (args.use_aklay === false) {
    overrides.value = userStatus.ticketPrice
    const tx = await Round.connect(wallet).buyTicket(args.referent, overrides)
    await tx.wait()
    console.log('#buyTicket() -> ', tx.hash)
  } else {
    const AKlay = await getAKlay()
    const approveTx = await AKlay.connect(wallet).approve(
      Round.address,
      userStatus.ticketPrice,
      overrides,
    )
    await approveTx.wait()
    console.log('#approve() -> ', approveTx.hash)

    const buyTx = await Round.connect(wallet).buyTicketAKlay(
      userStatus.ticketPrice,
      args.referent,
      overrides,
    )
    await buyTx.wait()
    console.log('#buyTicket() -> ', buyTx.hash)
  }
}

main()
