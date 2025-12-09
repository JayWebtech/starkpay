'use client';
import React, { useEffect, useState, useCallback } from 'react';
import InputField from '../form/InputField';
import Tabs from './Tabs';
import Button from '../form/Button';
import axiosInstance from '@/services/config';
import toast from 'react-hot-toast';
import SelectField from '../form/SelectField';
import { NetworkProviders } from '@/data/NetworkProviders';
import { TVProviders } from '@/data/TVProviders';
import LoadingIndicator from '../loader/LoadingIndicator';
import { ElectricityProviders } from '@/data/ElectricityCompany';
import { DataPlan, TVPlan, UtilityPlan, TVProvider } from '@/types/api';
import { useAccount, useNetwork } from '@starknet-react/core';
import { Call, shortString } from 'starknet';
import { nanoid } from 'nanoid';
import { getSupportedTokens, getContractAddress } from '@/constants/token';
import { formatSTRKAmount } from '@/utils/formatStrkAmount';
import TimeoutModal from '../modal/TimeoutModal';
import { Loader2, Wallet, ArrowRight, Plane, Hotel, Lightbulb, Smartphone, Wifi, Tv, House } from 'lucide-react';
import SuccessModal from '../modal/SuccessModal';
import { motion } from 'framer-motion';

interface FormState {
  phoneNumber: string;
  amount: string;
  IUCNumber: string;
  meterNumber: string;
}

/**
 * PayBillForm Component
 * Main payment interface for all utility bill types
 * Handles airtime, data, cable TV, and electricity payments
 */
/**
 * PayBillForm Component
 * Main payment interface for all utility bill types
 * Handles airtime, data, cable TV, and electricity payments
 */

import { Tab } from './Tabs';

const mainTabs: Tab[] = [
  { name: 'Utility', id: 'utility', icon: <House className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { name: 'Flight', id: 'flight', icon: <Plane className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { name: 'Hotels', id: 'hotels', icon: <Hotel className="w-4 h-4 sm:w-5 sm:h-5" /> },
];

const utilityTabs: Tab[] = [
  { name: 'Airtime', id: 'buy-airtime', icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { name: 'Data', id: 'buy-data', icon: <Wifi className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { name: 'Cable', id: 'pay-cable', icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { name: 'Electricity', id: 'pay-utility', icon: <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" /> },
];

const PayBillForm: React.FC = () => {
  // Form state
  const [activeCategory, setActiveCategory] = useState<string>('utility');

  const [activeTab, setActiveTab] = useState<string>('buy-airtime');
  const [formState, setFormState] = useState<FormState>({
    phoneNumber: '',
    amount: '',
    IUCNumber: '',
    meterNumber: '',
  });
  
  // Provider/plan state
  const [networkLogo, setNetworkLogo] = useState<string | null>(null);
  const [dataPlans, setDataPlans] = useState<DataPlan[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTV, setSelectedTV] = useState<TVProvider | null>(null);
  const [tVPlans, setTVPlans] = useState<TVPlan[] | null>(null);
  const [selectedTVPlan, setSelectedTVPlan] = useState<string>('');
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const [utilityPlans, setUtilityPlans] = useState<UtilityPlan[]>([]);
  const [selectedUtilityPlan, setSelectedUtilityPlan] = useState<UtilityPlan | null>(null);
  
  // Loading/UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState('');
  const [isRefunded, setIsRefunded] = useState<boolean>(false);
  
  // Price state
  const [starkAmount, setStarkAmount] = useState<string | null>(null);
  const [amountInSTRK, setAmountInSTRK] = useState<number | null>(null);
  const [networkCode, setNetworkCode] = useState<string | null>(null);
  const [strkBaseAmount, setStrkBaseAmount] = useState<number | null>(null);
  
  // Wallet state
  const { address, account } = useAccount();
  const [isMainnet, setIsMainnet] = useState<boolean>(true);
  const { chain } = useNetwork();
  const CONTRACT_ADDRESS = getContractAddress(isMainnet);
  const SUPPORTED_TOKENS = getSupportedTokens(isMainnet);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  // Detect network provider from phone number
  const detectProvider = useCallback(
    (number: string) => {
      if (number.length >= 4) {
        const prefix = number.slice(0, 4);
        const provider = NetworkProviders.find((p) => p.prefixes.includes(prefix));

        if (provider) {
          setNetworkLogo(provider.logo);
          setNetworkCode(provider.name);
          if (!dataPlans && activeTab === 'buy-data') {
            getDataPlans(provider.name);
          }
        } else {
          toast.error('Invalid phone number');
          setNetworkLogo(null);
        }
      } else {
        setDataPlans(null);
        setNetworkLogo(null);
      }
    },
    [activeTab, dataPlans]
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));

      if (name === 'phoneNumber') {
        detectProvider(value);
      }
    },
    [detectProvider]
  );

  // Fetch data plans
  const getDataPlans = useCallback(async (network: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/data/plans?networkCode=${network}`);
      if (response.status) {
        setDataPlans(response?.data[0]?.PRODUCT);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch data plans');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  // Fetch TV plans
  const getTVPlans = useCallback(async (providerCode: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/cable/plans?provider=${providerCode}`);
      if (response.status) {
        setTVPlans(response.data);
      } else {
        toast.error(response?.data?.msg || 'Failed to fetch TV plans');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch TV plans');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  // Fetch utility plans
  const getUtilityPlans = useCallback(async (providerCode: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/utility/plans?provider=${providerCode}`);
      if (response.status) {
        setUtilityPlans(response.data);
        setSelectedUtilityPlan(null);
      } else {
        toast.error('No plans found for this provider');
        setUtilityPlans([]);
      }
    } catch (error: any) {
      toast.error(error?.msg || 'Failed to fetch electricity plan');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  // Get transaction type for contract call
  const getTxnType = () => {
    switch (activeTab) {
      case 'buy-data':
        return shortString.encodeShortString('Data');
      case 'buy-airtime':
        return shortString.encodeShortString('Airtime');
      case 'pay-cable':
        return shortString.encodeShortString('Cable');
      case 'pay-utility':
        return shortString.encodeShortString('Utility');
      default:
        break;
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!isMainnet) {
      toast.error('You are currently on Testnet.');
      return;
    }
    if (!isMainnet && parseFloat(formState.amount) > 100) {
      toast.error('You are currently on Testnet. Maximum amount is 100');
      return;
    }
    if (!address || !account) {
      toast.error('Please connect your wallet to proceed');
      return;
    }

    if (formState.amount === '') {
      toast.error('Amount is required');
      return;
    }

    if (parseFloat(formState.amount) < 100) {
      toast.error('Amount must be greater than 100');
      return;
    }

    if (activeTab === 'pay-cable' && !selectedTV) {
      toast.error('Please select a TV provider');
      return;
    }

    if (activeTab === 'pay-cable' && !formState.IUCNumber) {
      toast.error('IUC Number is required');
      return;
    }

    if (activeTab !== 'pay-utility' && !formState.phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    if (activeTab !== 'pay-utility' && formState?.phoneNumber?.length < 11) {
      toast.error('Phone number must be 11 digits');
      return;
    }

    if (!starkAmount) {
      toast.error('No amount found, please refresh the page');
      return;
    }

    if (!networkLogo) {
      toast.error('You entered an invalid number');
      return;
    }

    let refcode = nanoid(10);
    let base_refcode = refcode;
    refcode = shortString.encodeShortString(refcode);
    let type = getTxnType();
    let txHash = '';

    const amount = BigInt(amountInSTRK || 0);
    const low = amount & BigInt('0xffffffffffffffffffffffffffffffff');
    const high = amount >> BigInt(128);

    try {
      setIsBtnLoading(true);
      const calls: Call[] = [
        {
          entrypoint: 'approve',
          contractAddress: SUPPORTED_TOKENS.STRK.address,
          calldata: [CONTRACT_ADDRESS as `0x${string}`, low.toString(), high.toString()],
        },
        {
          entrypoint: 'transaction',
          contractAddress: CONTRACT_ADDRESS as `0x${string}`,
          calldata: [refcode.toString(), low.toString(), high.toString(), type?.toString() || ''],
        },
      ];

      const result = await account.execute(calls);
      txHash = result?.transaction_hash;

      const receiptStatus = await account.waitForTransaction(txHash);

      if (receiptStatus.statusReceipt === 'success') {
        // Store pending transaction
        const response = await axiosInstance.post(`/pending-transactions/store`, {
          hash: txHash,
          refcode: base_refcode,
          wallet_address: address,
          amount: parseFloat(formState.amount),
          stark_amount: strkBaseAmount,
          txn_type:
            activeTab === 'buy-airtime'
              ? 'Airtime'
              : activeTab === 'buy-data'
                ? 'Data'
                : activeTab === 'pay-cable'
                  ? 'Cable'
                  : 'Utility',
          status: 'pending',
        });

        if (!(response as any)?.success) {
          throw new Error('Failed to store pending transaction');
        }

        // Process based on transaction type
        if (activeTab === 'buy-airtime') {
          try {
            const airtimeResponse = await axiosInstance.post(
              `/airtime/buy`,
              {
                networkCode,
                phoneNumber: formState.phoneNumber,
                amount: formState.amount,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );

            if (airtimeResponse.status) {
              await axiosInstance.put(`/pending-transactions/${base_refcode}/update`, {
                status: 'completed',
              });

              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Airtime',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });

              try {
                const swapResponse = await axiosInstance.post(`/swap/submit`, {
                  amount: amountInSTRK,
                  fromToken: 'STRK',
                  toToken: 'USDT',
                  userAddress: address,
                  refcode: base_refcode,
                });
                console.log('Swap request submitted:', swapResponse.data);
              } catch (swapError) {
                console.error('Failed to submit swap request:', swapError);
              }

              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axiosInstance.put(`/pending-transactions/${base_refcode}/update`, {
                status: 'failed',
              });

              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Airtime',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              toast.error(
                airtimeResponse.data.message || 'Failed to buy airtime. You will be refunded'
              );
              setIsRefunded(true);
              try {
                const refundResponse = await axiosInstance.post(`/refunds/process`, {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success('Refund confirmed, please check your wallet');
                }
              } catch (error: any) {
                toast.error(error?.message || 'Failed to refund. Our team has been notified');
              } finally {
                setIsRefunded(false);
              }
            }
          } catch (error: any) {
            await axiosInstance.put(`/pending-transactions/${base_refcode}/update`, {
              status: 'failed',
            });
            toast.error(error?.message || 'Failed to buy airtime. You will be refunded');
            setIsRefunded(true);
            try {
              const refundResponse = await axiosInstance.post(`/refunds/process`, {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success('Refund confirmed, please check your wallet');
              }
            } catch (error: any) {
              toast.error(error?.message || 'Failed to refund. Our team has been notified');
            } finally {
              setIsRefunded(false);
            }
          }
        }

        if (activeTab === 'buy-data') {
          try {
            const dataResponse = await axiosInstance.post(
              `/data/buy`,
              {
                networkCode,
                phoneNumber: formState.phoneNumber,
                planId: selectedPlan,
                amount: formState.amount,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );

            if (dataResponse.data.status) {
              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Data',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Data',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              toast.error(dataResponse.data.msg || 'Failed to buy data');
              setIsRefunded(true);
              try {
                const refundResponse = await axiosInstance.post(`/refunds/process`, {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success('Refund confirmed, please check your wallet');
                }
              } catch (error: any) {
                toast.error(error?.message || 'Failed to refund. Our team has been notified');
              } finally {
                setIsRefunded(false);
              }
            }
          } catch (error: any) {
            toast.error(error?.message || 'Failed to buy data');
            setIsRefunded(true);
            try {
              const refundResponse = await axiosInstance.post(`/refunds/process`, {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success('Refund confirmed, please check your wallet');
              }
            } catch (error: any) {
              toast.error(error?.message || 'Failed to refund. Our team has been notified');
            } finally {
              setIsRefunded(false);
            }
          }
        }

        if (activeTab === 'pay-cable') {
          try {
            const cableResponse = await axiosInstance.post(
              `/cable/pay`,
              {
                provider: selectedTV?.name,
                iucNumber: formState.IUCNumber,
                planId: selectedTVPlan,
                amount: formState.amount,
                phoneNumber: formState.phoneNumber,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );

            if (cableResponse.data.status) {
              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Cable',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Cable',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              toast.error(cableResponse.data.msg || 'Failed to pay cable. You will be refunded');
              setIsRefunded(true);
              try {
                const refundResponse = await axiosInstance.post(`/refunds/process`, {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success('Refund confirmed, please check your wallet');
                }
              } catch (error: any) {
                toast.error(error?.message || 'Failed to refund. Our team has been notified');
              } finally {
                setIsRefunded(false);
              }
            }
          } catch (error: any) {
            toast.error(error?.message || 'Failed to pay cable. You will be refunded');
            setIsRefunded(true);
            try {
              const refundResponse = await axiosInstance.post(`/refunds/process`, {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success('Refund confirmed, please check your wallet');
              }
            } catch (error: any) {
              toast.error(error?.message || 'Failed to refund. Our team has been notified');
            } finally {
              setIsRefunded(false);
            }
          }
        }

        if (activeTab === 'pay-utility') {
          try {
            const utilityResponse = await axiosInstance.post(
              `/utility/pay`,
              {
                provider: selectedUtility,
                meterNumber: formState.meterNumber,
                planId: selectedUtilityPlan?.PRODUCT_ID,
                amount: formState.amount,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );
            if (utilityResponse.data.status) {
              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Utility',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axiosInstance.post(`/transactions/store`, {
                amount: formState.amount,
                txn_type: 'Utility',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              toast.error(
                utilityResponse.data.msg || 'Failed to pay utility. You will be refunded'
              );
              setIsRefunded(true);
              try {
                const refundResponse = await axiosInstance.post(`/refunds/process`, {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success('Refund confirmed, please check your wallet');
                }
              } catch (error: any) {
                toast.error(error?.message || 'Failed to refund. Our team has been notified');
              } finally {
                setIsRefunded(false);
              }
            }
          } catch (error: any) {
            toast.error(error?.message || 'Failed to pay utility. You will be refunded');
            setIsRefunded(true);
            try {
              const refundResponse = await axiosInstance.post(`/refunds/process`, {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success('Refund confirmed, please check your wallet');
              }
            } catch (error: any) {
              toast.error(error?.message || 'Failed to refund. Our team has been notified');
            } finally {
              setIsRefunded(false);
            }
          }
        }
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error during contract calls:', error);
      toast.error(
        error instanceof Error
          ? `Contract interaction failed: ${error.message}`
          : 'Contract interaction failed with unknown error'
      );
    } finally {
      setIsBtnLoading(false);
    }
  };

  // Fetch STRK price
  const getStarkAmount = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/stark-price`);
      if (response?.status) {
        setStarkAmount(response?.data?.starknet?.ngn);
      } else {
        toast.error(response?.data?.message || 'Failed to fetch STRK price');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch STRK price');
    }
  }, [API_BASE]);

  // Calculate STRK amount when form amount changes
  useEffect(() => {
    if (formState.amount && starkAmount) {
      const ngnAmount = parseFloat(formState.amount);
      const strkPrice = parseFloat(starkAmount);
      const baseStrkAmount = ngnAmount / strkPrice;
      const feePercentage = 0.05;
      const strkAmount_ = baseStrkAmount + baseStrkAmount * feePercentage;
      setStrkBaseAmount(strkAmount_);
      const amountInWei = BigInt(Math.floor(strkAmount_ * 1e18));
      setAmountInSTRK(Number(amountInWei));
    }
  }, [formState.amount, starkAmount]);

  // Fetch TV plans when provider is selected
  useEffect(() => {
    if (selectedTV) {
      getTVPlans(selectedTV.name);
    }
  }, [selectedTV, getTVPlans]);

  // Initial STRK price fetch
  useEffect(() => {
    getStarkAmount();
  }, [getStarkAmount]);

  // Check network status
  useEffect(() => {
    if (!chain) return;

    if (chain.network !== 'mainnet') {
      setIsMainnet(false);
      toast.error('Switch to Starknet Mainnet to make real purchases.', { icon: '⚠️' });
    } else {
      setIsMainnet(true);
      toast.dismiss();
    }
  }, [chain]);

  // Price timeout modal
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowTimeoutModal(true);
    }, 15 * 60 * 1000);

    if (!isBtnLoading) {
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-syne text-2xl sm:text-3xl font-bold text-white mb-2">
            Pay Your Bills
          </h1>
          <p className="text-text-secondary">
            Fast, secure payments on Starknet
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && <LoadingIndicator />}

        {/* Main Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={mainTabs}
            activeTab={activeCategory}
            setActiveTab={setActiveCategory}
          />
        </div>

        {/* Utility Sub-tabs */}
        {activeCategory === 'utility' && (
          <Tabs
            tabs={utilityTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={(tabId) => {
              setFormState((prev) => ({
                 ...prev,
                 phoneNumber: '',
                 amount: '',
                 IUCNumber: '',
                 meterNumber: '',
              }));
              setNetworkLogo(null);
              setDataPlans(null);
            }}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        )}

        {/* Placeholder for other categories */}
        {activeCategory !== 'utility' && (
           <div className="glass-card rounded-2xl p-6 mt-4 text-center">
             <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
             <p className="text-text-secondary">This feature is currently under development.</p>
           </div>
        )}

        {/* Form Card */}
        {activeCategory === 'utility' && (
        <>
        <div className="glass-card rounded-2xl p-6 mt-4">

          {/* Airtime Form */}
          {activeTab === 'buy-airtime' && (
            <>
              <InputField
                id="phoneNumber"
                label="Phone Number"
                placeholder="Enter phone number"
                name="phoneNumber"
                value={formState.phoneNumber}
                onChange={handleInputChange}
                networkLogo={networkLogo}
                max={11}
                disabled={isBtnLoading || isRefunded}
              />
              <InputField
                id="amount"
                type="number"
                name="amount"
                label="Amount (NGN)"
                placeholder="Enter amount (min ₦100)"
                min={100}
                max={200000}
                value={formState.amount}
                onChange={handleInputChange}
                disabled={isBtnLoading || isRefunded}
              />
            </>
          )}

          {/* Data Form */}
          {activeTab === 'buy-data' && (
            <>
              <InputField
                id="phoneNumber"
                label="Phone Number"
                placeholder="Enter phone number"
                value={formState.phoneNumber}
                name="phoneNumber"
                onChange={handleInputChange}
                networkLogo={networkLogo}
                type="numeric"
                max={11}
                disabled={isBtnLoading || isRefunded}
              />
              {dataPlans && (
                <SelectField
                  id="dataPlan"
                  value={selectedPlan || ''}
                  onChange={(value) => {
                    if (typeof value === 'object' && 'PRODUCT_ID' in value) {
                      setSelectedPlan(value.PRODUCT_ID);
                      setFormState((prev) => ({
                        ...prev,
                        amount: value.PRODUCT_AMOUNT.toString(),
                      }));
                    }
                  }}
                  label="Select Data Plan"
                  options={dataPlans}
                  required={true}
                  disabled={isBtnLoading || isRefunded}
                />
              )}
            </>
          )}

          {/* Cable TV Form */}
          {activeTab === 'pay-cable' && (
            <>
              <label className="block text-text-secondary text-sm font-medium mb-3">
                Select Cable Provider
              </label>
              <div className="flex gap-3 mb-5">
                {TVProviders.map((provider) => (
                  <button
                    key={provider.code}
                    onClick={() => {
                      if (isBtnLoading || isRefunded) return;
                      setSelectedTV({
                        name: provider.name,
                        code: provider.code,
                        img: provider.img,
                      });
                    }}
                    className={`
                      flex-1 p-3 rounded-xl border transition-all duration-200
                      ${selectedTV?.code === provider.code
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,212,170,0.2)]'
                        : 'border-surface-border hover:border-primary/30'
                      }
                    `}
                  >
                    <img
                      src={provider.img}
                      alt={provider.name}
                      className="w-full h-10 object-contain rounded-md"
                    />
                  </button>
                ))}
              </div>

              {isLoading && (
                <p className="text-text-muted text-sm mb-4">Loading plans...</p>
              )}

              {tVPlans && !isLoading && (
                <>
                  <SelectField
                    id="tvPlan"
                    value={selectedTVPlan}
                    onChange={(value) => {
                      if (typeof value === 'object' && 'PACKAGE_ID' in value) {
                        setSelectedTVPlan(value.PACKAGE_ID);
                        setFormState((prev) => ({
                          ...prev,
                          amount: value.PACKAGE_AMOUNT.toString(),
                        }));
                      }
                    }}
                    label="Select Plan"
                    options={tVPlans}
                    required={true}
                    type="TV"
                    disabled={isBtnLoading || isRefunded}
                  />
                  <InputField
                    id="iucNumber"
                    label="SC/IUC Number"
                    placeholder="Enter SC/IUC Number"
                    name="IUCNumber"
                    value={formState.IUCNumber}
                    type="number"
                    onChange={handleInputChange}
                    disabled={isBtnLoading || isRefunded}
                  />
                  <InputField
                    id="phoneNumber"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={formState.phoneNumber}
                    name="phoneNumber"
                    onChange={handleInputChange}
                    networkLogo={networkLogo}
                    type="numeric"
                    max={11}
                    disabled={isBtnLoading || isRefunded}
                  />
                </>
              )}
            </>
          )}

          {/* Utility Form */}
          {activeTab === 'pay-utility' && (
            <>
              <SelectField
                id="utilityProvider"
                value={selectedUtility || ''}
                label="Electricity Provider"
                options={ElectricityProviders}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setSelectedUtility(value);
                    getUtilityPlans(value);
                  }
                }}
                type="electric"
                disabled={isBtnLoading || isRefunded}
              />

              {selectedUtility && utilityPlans.length > 0 && (
                <>
                  <label className="block text-text-secondary text-sm font-medium mb-3">
                    Select Plan Type
                  </label>
                  <div className="flex gap-3 mb-5">
                    {utilityPlans.map((plan) => (
                      <button
                        key={plan.PRODUCT_ID}
                        onClick={() => {
                          if (isBtnLoading || isRefunded) return;
                          setSelectedUtilityPlan(plan);
                        }}
                        className={`
                          flex-1 py-3 px-4 rounded-xl border transition-all duration-200 text-sm font-medium
                          ${selectedUtilityPlan?.PRODUCT_ID === plan.PRODUCT_ID
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-surface-border hover:border-primary/30 text-text-secondary'
                          }
                        `}
                      >
                        {plan.PRODUCT_TYPE.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedUtilityPlan && !isLoading && (
                <>
                  <InputField
                    id="meterNumber"
                    label="Meter/Account Number"
                    placeholder="Enter your meter/account number"
                    name="meterNumber"
                    value={formState.meterNumber}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        meterNumber: e.target.value,
                      }))
                    }
                    disabled={isBtnLoading || isRefunded}
                  />
                  <InputField
                    id="amount"
                    type="number"
                    label="Amount (NGN)"
                    placeholder={`Min: ₦${selectedUtilityPlan.MINIMUN_AMOUNT} - Max: ₦${selectedUtilityPlan.MAXIMUM_AMOUNT}`}
                    name="amount"
                    value={formState.amount}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    min={selectedUtilityPlan.MINIMUN_AMOUNT}
                    max={selectedUtilityPlan.MAXIMUM_AMOUNT}
                    disabled={isBtnLoading || isRefunded}
                  />
                </>
              )}
            </>
          )}

          {/* STRK Amount Display */}
          {starkAmount && address && account && formState?.amount && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">You will pay</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-syne font-bold text-lg">
                    {formatSTRKAmount(amountInSTRK)} STRK
                  </span>
                </div>
              </div>
              <p className="text-white text-xs mt-1">
                Includes 5% service fee
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          className="mt-6 w-full py-4 flex items-center justify-center text-sm gap-2"
          onClick={handlePayment}
          disabled={isBtnLoading || isRefunded}
          size="lg"
        >
          {isBtnLoading || isRefunded ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isRefunded ? 'Processing refund...' : 'Processing...'}
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Pay Now
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        {/* Security Note */}
        <p className="text-center text-text-muted text-xs mt-4">
          Secured by Starknet blockchain
        </p>
        </>
        )}
      </motion.div>

      {/* Modals */}
      <TimeoutModal isOpen={showTimeoutModal} onClose={() => window.location.reload()} />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setFormState({
            phoneNumber: '',
            amount: '',
            IUCNumber: '',
            meterNumber: '',
          });
          setShowSuccessModal(false);
        }}
        txHash={successTxHash}
        isMainnet={isMainnet}
        amount={formState.amount}
        starkAmount={strkBaseAmount}
        phoneNumber={formState.phoneNumber}
        iucNumber={formState.IUCNumber}
        meterNumber={formState.meterNumber}
        network={networkCode}
        txnType={
          activeTab === 'buy-airtime'
            ? 'Airtime'
            : activeTab === 'buy-data'
              ? 'Data'
              : activeTab === 'pay-cable'
                ? 'Cable'
                : 'Utility'
        }
      />
    </div>
  );
};

export default PayBillForm;
