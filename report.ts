// Run command: npx ts-node report.ts

import { ChainId, Fetcher, WETH, Pair } from "@uniswap/sdk";
import { BigNumber, ethers } from "ethers";

const PAIR_ABI = require("./unipair_abi.json");

const ZERO = BigNumber.from(0);
const ONE = BigNumber.from(1);
const TWO = BigNumber.from(2);
const ONET = BigNumber.from(1000);

const getBlockByDate = async (
  dateStr: string,
  provider: ethers.providers.Provider,
  roundUpper: boolean
) => {
  const unixdate = BigNumber.from(Date.parse(dateStr)).div(ONET);

  let upper = BigNumber.from(await provider.getBlockNumber());
  let down = ZERO;
  let diff = upper.sub(down);
  const MAX_TRY = 1000;
  let i = 0;
  while (diff.gt(ONE) && i < MAX_TRY) {
    i++;
    const newTry = down.add(upper.sub(down).div(TWO));
    const block = await provider.getBlock(newTry.toNumber());
    const timestamp = BigNumber.from(block.timestamp);
    if (timestamp.lt(unixdate)) {
      down = BigNumber.from(block.number);
    } else {
      upper = BigNumber.from(block.number);
    }
    diff = upper.sub(down);
  }

  return roundUpper ? upper : down;
};

const getETHPosition = (pair: Pair) => {
  const weth = WETH[ChainId.MAINNET];
  if (pair.token0.address === weth.address) {
    return 0;
  } else {
    return 1;
  }
};

const getSwaps = async (tokenAddr: string, from: string, to: string) => {
  const provider = new ethers.providers.InfuraProvider("mainnet");

  const fromBlock = await getBlockByDate(from, provider, false);
  const toBlock = await getBlockByDate(to, provider, true);
  console.log(
    `Looking from block ${fromBlock.toString()} to ${toBlock.toString()}`
  );

  const token = await Fetcher.fetchTokenData(
    ChainId.MAINNET,
    tokenAddr,
    provider
  );
  const weth = WETH[ChainId.MAINNET];
  const pair = await Fetcher.fetchPairData(token, weth, provider);

  const pairContract = new ethers.Contract(
    pair.liquidityToken.address,
    PAIR_ABI,
    provider
  );

  const events = await pairContract.queryFilter(
    pairContract.filters.Swap(),
    fromBlock.toNumber(),
    toBlock.toNumber()
  );

  const ethPosition = getETHPosition(pair);

  const total = events.reduce((prev, curr) => {
    const values = curr.args;
    const amountIn = ethPosition === 0 ? values.amount0In : values.amount1In;
    const amountOut = ethPosition === 0 ? values.amount0Out : values.amount1Out;

    const currValue = amountIn.add(amountOut);
    return prev.add(currValue);
  }, ZERO);

  const ethValue = ethers.utils.formatUnits(total, "ether");
  console.log(`Total ETH transacted = ${ethValue}`);
};

const main = async () => {
  const address = "SOME_ADDRESS";
  await getSwaps(address, "2021-04-14 19:08:45 UTC", "2021-04-14 22:00:32 UTC");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
