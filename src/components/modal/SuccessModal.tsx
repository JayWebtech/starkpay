import React from 'react';
import { X } from 'lucide-react';
import Button from '../form/Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  isMainnet: boolean;
  amount: string;
  starkAmount: number | null;
  phoneNumber?: string;
  iucNumber?: string;
  meterNumber?: string;
  network?: string | null;
  txnType: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  txHash, 
  isMainnet,
  amount,
  starkAmount,
  phoneNumber,
  iucNumber,
  meterNumber,
  network,
  txnType
}) => {
  if (!isOpen) return null;

  const handleTxClick = () => {
    if (isMainnet) {
      window.open(`https://voyager.online/tx/${txHash}`, '_blank');
    } else {
      window.open(`https://sepolia.voyager.online/tx/${txHash}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-secondary border border-stroke/50 rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Transaction Successful!</h3>
          
          <div className="bg-black/20 rounded-lg p-4 mb-4 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Transaction Type</span>
              <span className="text-sm text-white">{txnType}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Amount (NGN)</span>
              <span className="text-sm text-white">₦{parseFloat(amount).toFixed(2)}</span>
            </div>

            {starkAmount && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount (STRK)</span>
                <span className="text-sm text-white">{starkAmount.toFixed(6)} STRK</span>
              </div>
            )}

            {phoneNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Phone Number</span>
                <span className="text-sm text-white">{phoneNumber}</span>
              </div>
            )}

            {iucNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">IUC Number</span>
                <span className="text-sm text-white">{iucNumber}</span>
              </div>
            )}

            {meterNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Meter Number</span>
                <span className="text-sm text-white">{meterNumber}</span>
              </div>
            )}

            {network && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Network</span>
                <span className="text-sm text-white">{network}</span>
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Transaction Hash</span>
              <button
                onClick={handleTxClick}
                className="text-primary hover:text-primary/80 text-sm break-all text-left cursor-pointer"
              >
                {txHash}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Date & Time</span>
              <span className="text-sm text-white">{new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mb-4">
            <p>Thank you for using StarkPay</p>
            <p className="mt-1">This receipt serves as proof of your transaction</p>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 