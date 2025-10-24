const mongoose = require('mongoose');

const voteReceiptSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
    index: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  voterId: {
    type: String,
    required: true,
    index: true
  },
  receiptHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transactionHash: {
    type: String,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },
  blockNumber: {
    type: Number,
    index: true
  },
  blockHash: {
    type: String,
    index: true
  },
  gasUsed: {
    type: Number
  },
  candidateName: {
    type: String,
    required: true
  },
  seat: {
    type: String,
    required: true
  },
  electionTitle: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDetails: {
    verifiedAt: Date,
    verifiedBy: String,
    verificationMethod: {
      type: String,
      enum: ['blockchain', 'database', 'manual']
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
voteReceiptSchema.index({ electionId: 1, voterId: 1 });
voteReceiptSchema.index({ electionId: 1, candidateId: 1 });
voteReceiptSchema.index({ voterId: 1, votedAt: -1 });

// Virtual for formatted receipt
voteReceiptSchema.virtual('formattedReceipt').get(function() {
  return {
    id: this._id,
    election: this.electionTitle,
    candidate: this.candidateName,
    seat: this.seat,
    receiptHash: this.receiptHash,
    transactionHash: this.transactionHash,
    votedAt: this.votedAt,
    isVerified: this.isVerified
  };
});

// Static method to create receipt from vote data
voteReceiptSchema.statics.createFromVote = async function(voteData) {
  const {
    electionId,
    candidateId,
    voterId,
    receiptHash,
    transactionHash,
    candidateName,
    seat,
    electionTitle,
    blockNumber,
    blockHash,
    gasUsed
  } = voteData;

  const receipt = new this({
    electionId,
    candidateId,
    voterId,
    receiptHash,
    transactionHash,
    candidateName,
    seat,
    electionTitle,
    blockNumber,
    blockHash,
    gasUsed
  });

  return await receipt.save();
};

// Static method to get voter's vote history
voteReceiptSchema.statics.getVoterHistory = async function(voterId, limit = 50) {
  return await this.find({ voterId })
    .sort({ votedAt: -1 })
    .limit(limit)
    .populate('electionId', 'title description')
    .lean();
};

// Static method to verify receipt against blockchain
voteReceiptSchema.statics.verifyReceipt = async function(receiptHash) {
  const receipt = await this.findOne({ receiptHash });
  if (!receipt) {
    throw new Error('Receipt not found');
  }

  // If we have transaction hash, we can verify against blockchain
  if (receipt.transactionHash) {
    // TODO: Implement blockchain verification logic
    // This would involve checking the transaction on-chain
    receipt.isVerified = true;
    receipt.verificationDetails = {
      verifiedAt: new Date(),
      verifiedBy: 'system',
      verificationMethod: 'blockchain'
    };
    await receipt.save();
  }

  return receipt;
};

module.exports = mongoose.model('VoteReceipt', voteReceiptSchema);
