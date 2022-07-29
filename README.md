## Snowball Ticket Bot

### Setting
```shell
# node version >=14
npm install
```

### Buy ticket with KLAY
```shell
node main.js --private_key <PRIVATE_KEY> --id <ROUND_ID>

ex) node main.js --private_key 0x0000000000000000000000000000000000000000000000000000000000000000 --id 1
```

### Buy ticket with AKLAY
```shell
node main.js --private_key <PRIVATE_KEY> --id <ROUND_ID> --use_aklay

ex) node main.js --private_key 0x0000000000000000000000000000000000000000000000000000000000000000 --id 1 --use_aklay
```