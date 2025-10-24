import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, CheckCircle, FileText, Camera, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useGlobalUI } from '../../components/common';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';
import VoterDashboardLayout from './VoteDashboardLayout';

const VoterKycComplete = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  const { selectedAccount, isConnected, connectMetaMask } = useMetaMaskContext();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });

  const [governmentId, setGovernmentId] = useState(null);
  const [proofOfAddress, setProofOfAddress] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      showLoader('Connecting wallet...');
      await connectMetaMask();
      showToast('Wallet connected', 'success');
    } catch (e) {
      showToast(e?.message || 'Failed to connect wallet', 'error');
    } finally {
      hideLoader();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      showLoader('Submitting KYC...');

      // 1) Connect wallet server-side if present
      if (isConnected && (selectedAccount || '').length > 0) {
        try {
          await voterRegistrationAPI.connectWallet({ walletAddress: selectedAccount, walletType: 'MetaMask' });
        } catch (err) {
          // continue even if wallet connect fails; it might already be connected
        }
      }

      // 2) Upload documents (best-effort; server requires URL)
      const uploadDoc = async (type, file) => {
        if (!file) return;
        const safeName = encodeURIComponent(file.name || `${type}.bin`);
        const absoluteUrl = `${window.location.origin}/uploads/${safeName}`;
        await voterRegistrationAPI.uploadDocument({ documentType: type, fileUrl: absoluteUrl });
      };
      await uploadDoc('governmentId', governmentId);
      await uploadDoc('proofOfAddress', proofOfAddress);
      await uploadDoc('selfie', selfie);

      // 3) Update KYC info
      await voterRegistrationAPI.updateKycInfo({
        kycInfo: {
          firstName,
          lastName,
          phone,
          dateOfBirth,
          nationality,
          address: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country
          },
          verification: { kycStatus: 'pending', biometricStatus: 'pending', overallStatus: 'pending' },
          registrationSteps: {
            personalInfo: true,
            blockchainConnection: !!selectedAccount,
            documentUpload: !!(governmentId && proofOfAddress && selfie),
            biometricVerification: !!selfie,
            reviewSubmit: true
          },
          privacyConsent: {
            dataProcessing: true,
            biometricProcessing: true,
            blockchainStorage: true,
            marketingCommunications: false,
            consentDate: new Date()
          }
        }
      });

      // 4) Submit for verification
      await voterRegistrationAPI.submitRegistration({ privacyConsent: true });

      showToast('KYC submitted successfully! Awaiting verification.', 'success');
      navigate('/voter/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit KYC';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
      hideLoader();
    }
  };

  return (
    <VoterDashboardLayout currentTab="profile">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Complete Your KYC
            </h2>
            <div>
              {!isConnected ? (
                <button onClick={handleConnectWallet} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Connect Wallet
                </button>
              ) : (
                <div className="text-sm text-green-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {selectedAccount?.slice(0,6)}...{selectedAccount?.slice(-4)}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="First name" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Last Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Last name" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Phone" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Date of Birth</label>
                <input type="date" value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Nationality</label>
              <input value={nationality} onChange={(e)=>setNationality(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Country code or name" />
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-gray-300">Address</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  <input value={address.street} onChange={(e)=>setAddress({...address, street: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Street" />
                </div>
                <input value={address.city} onChange={(e)=>setAddress({...address, city: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="City" />
                <input value={address.state} onChange={(e)=>setAddress({...address, state: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="State" />
                <input value={address.zipCode} onChange={(e)=>setAddress({...address, zipCode: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="ZIP" />
                <input value={address.country} onChange={(e)=>setAddress({...address, country: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Country" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Government ID</label>
                <input type="file" accept="image/*,.pdf" onChange={(e)=>setGovernmentId(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Proof of Address</label>
                <input type="file" accept="image/*,.pdf" onChange={(e)=>setProofOfAddress(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2"><Camera className="w-4 h-4" /> Selfie</label>
                <input type="file" accept="image/*" onChange={(e)=>setSelfie(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-300" />
              </div>
            </div>

            <div className="pt-2">
              <button disabled={submitting} type="submit" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit KYC for Verification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </VoterDashboardLayout>
  );
};

export default VoterKycComplete;
