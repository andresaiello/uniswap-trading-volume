# uniswap-trading-volume

Script to calculate the trading volume of a token. There's two version, one with web3js and other (recommended) with ethers.
You don't need to know the pair address, the script calls uniswap to calculate it.
Also you don't need to know the block number for a period, you can use normal dates and the scripts calculate the block height.

## Author

Andres Aiello

## Installation

```bash
npm install
```

## Usage

Update the main address and run it

```
npx ts-node report.ts
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
