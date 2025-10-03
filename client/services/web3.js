import Web3 from "web3";
import Voting from "../../blockchain/build/contracts/Voting.json";

let web3;
let contract;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Voting.networks[networkId];

    if (!deployedNetwork) {
      throw new Error("Voting contract not deployed on this network");
    }

    contract = new web3.eth.Contract(Voting.abi, deployedNetwork.address);
    return { web3, contract };
  } else {
    throw new Error("Please install MetaMask!");
  }
};

export const getCandidates = async () => {
  if (!contract) throw new Error("Contract not initialized");
  const count = await contract.methods.candidatesCount().call();
  const candidates = [];
  for (let i = 1; i <= count; i++) {
    const candidate = await contract.methods.getCandidate(i).call();
    candidates.push({
      id: candidate[0],
      name: candidate[1],
      votes: candidate[2],
    });
  }
  return candidates;
};

export const voteForCandidate = async (id) => {
  if (!contract) throw new Error("Contract not initialized");
  const accounts = await web3.eth.getAccounts();
  return contract.methods.vote(id).send({ from: accounts[0] });
};

export const addCandidate = async (name) => {
  if (!contract) throw new Error("Contract not initialized");
  const accounts = await web3.eth.getAccounts();
  return contract.methods.addCandidate(name).send({ from: accounts[0] });
};
