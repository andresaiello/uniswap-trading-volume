const Web3 = require("web3");
import { Big } from "big.js";
//import PAIR_ABI from "./unipair_abi.json";
import * as PAIR_ABI from "./unipair_abi.json";
const infuraUrl = "INFURA_KEY";

const getETHPosition = () => {
  return 1;
};

const weiToEth = (b: Big) => b.div(Big("1000000000000000000"));

const getSwaps = async (pairAddr: string, from: string, to: string) => {
  const provider = new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${infuraUrl}`
  );
  const web3 = new Web3(provider);
  //@ts-ignore
  const pairContract = new web3.eth.Contract(PAIR_ABI, pairAddr);

  const events = await pairContract.getPastEvents(
    "Swap",
    {
      fromBlock: from,
      toBlock: to,
    },
    function (error, events) {}
  );

  const ethPosition = getETHPosition();

  const total = events.reduce((prev, curr) => {
    const values = curr.returnValues;
    const amountIn = ethPosition === 0 ? values.amount0In : values.amount1In;

    const amountOut = ethPosition === 0 ? values.amount0Out : values.amount1Out;

    const currValue = Big(amountIn).plus(Big(amountOut));
    return prev.plus(currValue);
  }, Big("0"));

  console.log(`Total ETH transacted = ${weiToEth(total).toString()}`);
};

const main = async () => {
  const address = "SOME_ADDRESS";
  await getSwaps(address, "12240000", "12240771");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
