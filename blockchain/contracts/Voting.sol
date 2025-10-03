// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
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
        uint[] candidateIds;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) hasVoted; // per-election voter record
        uint candidatesCount;
        bool exists;
    }

    mapping(uint => Election) private elections;
    uint public electionsCount;
    address public owner;

    event ElectionCreated(uint indexed electionId, string title);
    event CandidateAdded(uint indexed electionId, uint candidateId, string name);
    event VoteCast(uint indexed electionId, address indexed voter, uint candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(string memory _title, string memory _description, uint _startsAt, uint _endsAt) public onlyOwner returns (uint) {
        electionsCount++;
        Election storage e = elections[electionsCount];
        e.id = electionsCount;
        e.title = _title;
        e.description = _description;
        e.startsAt = _startsAt;
        e.endsAt = _endsAt;
        e.exists = true;
        emit ElectionCreated(electionsCount, _title);
        return electionsCount;
    }

    function addCandidate(uint _electionId, string memory _name) public onlyOwner returns (uint) {
        require(elections[_electionId].exists, "Election not found");
        Election storage e = elections[_electionId];
        e.candidatesCount++;
        uint cid = e.candidatesCount;
        e.candidates[cid] = Candidate(cid, _name, 0);
        e.candidateIds.push(cid);
        emit CandidateAdded(_electionId, cid, _name);
        return cid;
    }

    function vote(uint _electionId, uint _candidateId) public {
        require(elections[_electionId].exists, "Election not found");
        Election storage e = elections[_electionId];
        require(!e.hasVoted[msg.sender], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= e.candidatesCount, "Invalid candidate");
        e.hasVoted[msg.sender] = true;
        e.candidates[_candidateId].voteCount++;
        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    // getters
    function getElection(uint _electionId) public view returns (uint id, string memory title, string memory description, uint startsAt, uint endsAt, uint[] memory candidateIds) {
        require(elections[_electionId].exists, "Election not found");
        Election storage e = elections[_electionId];
        return (e.id, e.title, e.description, e.startsAt, e.endsAt, e.candidateIds);
    }

    function getCandidate(uint _electionId, uint _candidateId) public view returns (uint id, string memory name, uint voteCount) {
        require(elections[_electionId].exists, "Election not found");
        Election storage e = elections[_electionId];
        Candidate storage c = e.candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    function hasVotedIn(uint _electionId, address _voter) public view returns (bool) {
        require(elections[_electionId].exists, "Election not found");
        return elections[_electionId].hasVoted[_voter];
    }
}
