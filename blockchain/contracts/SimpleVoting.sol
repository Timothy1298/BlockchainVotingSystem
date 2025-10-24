// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string title;
        string description;
        uint startsAt;
        uint endsAt;
        uint candidatesCount;
        bool exists;
        bool votingEnabled;
        uint totalVotes;
    }

    mapping(uint => Election) public elections;
    mapping(uint => mapping(uint => Candidate)) private candidates; // electionId => candidateId => Candidate
    mapping(uint => mapping(address => bool)) private hasVoted; // electionId => voter => hasVoted
    mapping(uint => mapping(address => bool)) private registeredVoters; // electionId => voter => isRegistered
    
    uint public electionsCount;
    address public owner;

    event ElectionCreated(uint indexed electionId, string title);
    event CandidateAdded(uint indexed electionId, uint indexed candidateId, string name);
    // Do not emit wallet address to preserve anonymity; emit a deterministic receipt instead
    event VoteCast(uint indexed electionId, uint indexed candidateId, bytes32 receipt);
    event VoterRegistered(uint indexed electionId, address indexed voter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier electionExists(uint _electionId) {
        require(elections[_electionId].exists, "Election not found");
        _;
    }

    modifier onlyRegisteredVoter(uint _electionId) {
        require(registeredVoters[_electionId][msg.sender], "Voter not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Create Election
    function createElection(string memory _title, string memory _description, uint _startsAt, uint _endsAt) public onlyOwner returns (uint) {
        electionsCount++;
        Election storage e = elections[electionsCount];
        e.id = electionsCount;
        e.title = _title;
        e.description = _description;
        e.startsAt = _startsAt;
        e.endsAt = _endsAt;
        e.exists = true;
        e.votingEnabled = false;
        e.totalVotes = 0;
        e.candidatesCount = 0;
        
        emit ElectionCreated(electionsCount, _title);
        return electionsCount;
    }

    // Register Voter
    function registerVoter(uint _electionId, address _voter) public onlyOwner electionExists(_electionId) {
        require(!registeredVoters[_electionId][_voter], "Voter already registered");
        registeredVoters[_electionId][_voter] = true;
        emit VoterRegistered(_electionId, _voter);
    }

    // Add Candidate
    function addCandidate(uint _electionId, string memory _name) public onlyOwner electionExists(_electionId) {
        Election storage e = elections[_electionId];
        e.candidatesCount++;
        uint cid = e.candidatesCount;
        candidates[_electionId][cid] = Candidate(cid, _name, 0);
        emit CandidateAdded(_electionId, cid, _name);
    }

    // Enable Voting
    function enableVoting(uint _electionId) public onlyOwner electionExists(_electionId) {
        elections[_electionId].votingEnabled = true;
    }

    // Cast Vote
    function castVote(uint _electionId, uint _candidateId) public electionExists(_electionId) onlyRegisteredVoter(_electionId) {
        Election storage e = elections[_electionId];
        require(e.votingEnabled, "Voting is not enabled");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= e.candidatesCount, "Invalid candidate");
        require(block.timestamp >= e.startsAt, "Election has not started");
        require(block.timestamp <= e.endsAt, "Election has ended");
        
        hasVoted[_electionId][msg.sender] = true;
        candidates[_electionId][_candidateId].voteCount++;
        e.totalVotes++;
        // Derive a receipt hash on-chain without leaking sender
        bytes32 receipt = keccak256(abi.encodePacked(_electionId, _candidateId, block.number, block.timestamp));
        emit VoteCast(_electionId, _candidateId, receipt);
    }

    // Get Election
    function getElection(uint _electionId) public view returns (uint id, string memory title, string memory description, uint startsAt, uint endsAt, uint candidatesCount, bool votingEnabled, uint totalVotes) {
        require(elections[_electionId].exists, "Election not found");
        Election storage e = elections[_electionId];
        return (e.id, e.title, e.description, e.startsAt, e.endsAt, e.candidatesCount, e.votingEnabled, e.totalVotes);
    }

    // Get Candidate
    function getCandidate(uint _electionId, uint _candidateId) public view returns (uint id, string memory name, uint voteCount) {
        require(elections[_electionId].exists, "Election not found");
        Candidate storage c = candidates[_electionId][_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    // Check if voter has voted
    function hasVotedIn(uint _electionId, address _voter) public view returns (bool) {
        require(elections[_electionId].exists, "Election not found");
        return hasVoted[_electionId][_voter];
    }

    // Check if voter is registered
    function isVoterRegistered(uint _electionId, address _voter) public view returns (bool) {
        require(elections[_electionId].exists, "Election not found");
        return registeredVoters[_electionId][_voter];
    }
}
