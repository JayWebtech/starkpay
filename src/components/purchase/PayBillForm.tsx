'use client';
import React, { useEffect, useState, useCallback } from 'react';
import InputField from '../form/InputField';
import Tabs from './Tabs';
import Button from '../form/Button';
import axios from 'axios';
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
import { Loader2 } from 'lucide-react';
import SuccessModal from '../modal/SuccessModal';

interface FormState {
  phoneNumber: string;
  amount: string;
  IUCNumber: string;
  meterNumber: string;
}

const PayBillForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('buy-airtime');
  const [formState, setFormState] = useState<FormState>({
    phoneNumber: '',
    amount: '',
    IUCNumber: '',
    meterNumber: '',
  });
  const [networkLogo, setNetworkLogo] = useState<string | null>(null);
  const [dataPlans, setDataPlans] = useState<DataPlan[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTV, setSelectedTV] = useState<TVProvider | null>(null);
  const [tVPlans, setTVPlans] = useState<TVPlan[] | null>(null);
  const [selectedTVPlan, setSelectedTVPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const [utilityPlans, setUtilityPlans] = useState<UtilityPlan[]>([]);
  const [selectedUtilityPlan, setSelectedUtilityPlan] = useState<UtilityPlan | null>(null);
  const [starkAmount, setStarkAmount] = useState<string | null>(null);
  const [amountInSTRK, setAmountInSTRK] = useState<number | null>(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState('');
  const [networkCode, setNetworkCode] = useState<string | null>(null);
  const [strkBaseAmount, setStrkBaseAmount] = useState<number | null>(null);
  const [isRefunded, setIsRefunded] = useState<boolean>(false);
  const { address, account } = useAccount();

  const [isMainnet, setIsMainnet] = useState<boolean>(true);
  const { chain } = useNetwork();
  const CONTRACT_ADDRESS = getContractAddress(isMainnet);
  const SUPPORTED_TOKENS = getSupportedTokens(isMainnet);

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
          toast.error('You entered an invalid number');
          setNetworkLogo(null);
        }
      } else {
        setDataPlans(null);
        setNetworkLogo(null);
      }
    },
    [activeTab, dataPlans]
  );

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

  const getDataPlans = useCallback(async (network: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/get-data-plans', { network });
      if (response.data.status) {
        setDataPlans(response?.data?.data[0]?.PRODUCT);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch data plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTVPlans = useCallback(async (providerCode: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/get-cable-plans', {
        providerCode,
      });
      if (response.data.status) {
        setTVPlans(response.data.data);
      } else {
        toast.error(response?.data?.msg || 'Failed to fetch TV plans');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch TV plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUtilityPlans = useCallback(async (providerCode: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/get-utility-plans', {
        providerCode,
      });

      if (response.data.status) {
        setUtilityPlans(response.data.data);
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
  }, []);

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

  const handlePayment = async () => {
    console.log(account);
    if (!isMainnet) {
      toast.error('You are currently on Testnet.');
      return;
    }
    if (!isMainnet && parseFloat(formState.amount) > 100) {
      toast.error('You are currently on Testnet. Maximum amount is 100');
      return;
    }
    if (!address || !account) {
      console.log(address, account);
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

    // Handle the amount as a BigInt with proper decimal places
    const amount = BigInt(amountInSTRK || 0);
    const low = amount & BigInt('0xffffffffffffffffffffffffffffffff');
    const high = amount >> BigInt(128);
    console.log('low', low);
    console.log('high', high);
    console.log('amount', amount, amountInSTRK);

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
      const result = await account?.execute(calls);
      txHash = result?.transaction_hash;

      const receiptStatus = await account.waitForTransaction(txHash);

      if (receiptStatus.statusReceipt === 'success') {
        // Store in pending_transactions first
        const response = await axios.post('/api/store-pending-transaction', {
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

        if (!response?.data?.success) {
          throw new Error('Failed to store pending transaction');
        }

        if (activeTab === 'buy-airtime') {
          try {
            const airtimeResponse = await axios.post(
              '/api/buy-airtime',
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

            if (airtimeResponse.data.status) {
              // Update pending transaction status
              await axios.post('/api/update-pending-transaction', {
                hash: txHash,
                refcode: base_refcode,
                status: 'completed',
              });

              // Store in main transactions table
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Airtime',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              // Update pending transaction status to failed
              await axios.post('/api/update-pending-transaction', {
                hash: txHash,
                refcode: base_refcode,
                status: 'failed',
              });

              // Store failed transaction
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Airtime',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: false,
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
                const refundResponse = await axios.post('/api/refund', {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success(
                    'You refund has been confirmed, please check your wallet for the refund'
                  );
                }
              } catch (error: any) {
                toast.error(error?.message || 'Failed to refund. Our team has been notified');
              } finally {
                setIsRefunded(false);
              }
            }
          } catch (error: any) {
            // Update pending transaction status to failed
            await axios.post('/api/update-pending-transaction', {
              hash: txHash,
              refcode: base_refcode,
              status: 'failed',
            });
            toast.error(error?.message || 'Failed to buy airtime. You will be refunded');
            setIsRefunded(true);
            try {
              const refundResponse = await axios.post('/api/refund', {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success(
                  'You refund has been confirmed, please check your wallet for the refund'
                );
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
            const dataResponse = await axios.post(
              '/api/buy-data',
              {
                networkCode,
                phoneNumber: formState.phoneNumber,
                planId: selectedPlan,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );

            if (dataResponse.data.status) {
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Data',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Data',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              toast.error(dataResponse.data.msg || 'Failed to buy data');
              setIsRefunded(true);
              try {
                const refundResponse = await axios.post('/api/refund', {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success(
                    'You refund has been confirmed, please check your wallet for the refund'
                  );
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
              const refundResponse = await axios.post('/api/refund', {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success(
                  'You refund has been confirmed, please check your wallet for the refund'
                );
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
            const cableResponse = await axios.post(
              '/api/pay-cable',
              {
                tvcode: selectedTV?.code,
                pacakge_code: selectedTVPlan,
                SmartCardNo: formState.IUCNumber,
                PhoneNo: formState.phoneNumber,
                amount: formState.amount,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );

            if (cableResponse.data.status) {
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Cable',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Cable',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              toast.error(cableResponse.data.msg || 'Failed to pay cable. You will be refunded');
              setIsRefunded(true);
              try {
                const refundResponse = await axios.post('/api/refund', {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success(
                    'You refund has been confirmed, please check your wallet for the refund'
                  );
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
              const refundResponse = await axios.post('/api/refund', {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success(
                  'You refund has been confirmed, please check your wallet for the refund'
                );
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
            const utilityResponse = await axios.post(
              '/api/pay-utility',
              {
                electric_company_code: selectedUtility,
                meter_type: selectedUtilityPlan?.PRODUCT_TYPE,
                meter_no: formState.meterNumber,
                amount: formState.amount,
                phone_no: formState.phoneNumber,
              },
              {
                headers: {
                  'x-transaction-hash': txHash,
                  'x-reference-code': base_refcode,
                },
              }
            );
            if (utilityResponse.data.status) {
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Utility',
                wallet_address: address,
                status: 'success',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
                phone_number: formState.phoneNumber,
                iuc_number: formState.IUCNumber,
                meter_number: formState.meterNumber,
                network: networkCode,
                stark_amount: strkBaseAmount,
              });
              setSuccessTxHash(txHash);
              setShowSuccessModal(true);
            } else {
              await axios.post('/api/store-transaction', {
                amount: formState.amount,
                txn_type: 'Utility',
                wallet_address: address,
                status: 'failed',
                hash: txHash,
                refcode: base_refcode,
                timestamp: new Date().toISOString(),
                refunded: false,
                used: true,
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
                const refundResponse = await axios.post('/api/refund', {
                  isMainet: isMainnet,
                  refcode: base_refcode,
                  amountInSTRK: amountInSTRK,
                });
                if (refundResponse.data.status) {
                  toast.success(
                    'You refund has been confirmed, please check your wallet for the refund'
                  );
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
              const refundResponse = await axios.post('/api/refund', {
                isMainet: isMainnet,
                refcode: base_refcode,
                amountInSTRK: amountInSTRK,
              });
              if (refundResponse.data.status) {
                toast.success(
                  'You refund has been confirmed, please check your wallet for the refund'
                );
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

  const getStarkAmount = useCallback(async () => {
    try {
      const response = await axios.post('/api/get-stark-price');
      if (response?.data?.status) {
        setStarkAmount(response?.data?.data?.starknet?.ngn);
      } else {
        toast.error(response.data.message || 'Failed to fetch Stark amount, try again');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch Stark amount, try again');
    }
  }, []);

  useEffect(() => {
    if (formState.amount && starkAmount) {
      const ngnAmount = parseFloat(formState.amount);
      const strkPrice = parseFloat(starkAmount);
      const baseStrkAmount = ngnAmount / strkPrice;
      const feePercentage = 0.05; // 5%
      const strkAmount = baseStrkAmount + baseStrkAmount * feePercentage;
      setStrkBaseAmount(strkAmount);
      const amountInWei = BigInt(Math.floor(strkAmount * 1e18));
      setAmountInSTRK(Number(amountInWei));
    }
  }, [formState.amount, starkAmount]);

  useEffect(() => {
    if (selectedTV) {
      getTVPlans(selectedTV.name);
    }
  }, [selectedTV, getTVPlans]);

  useEffect(() => {
    getStarkAmount();
  }, []);

  useEffect(() => {
    if (!chain) return;

    if (chain.network !== 'mainnet') {
      setIsMainnet(false);
      toast.error(
        'You are currently on Testnet. Switch to Starknet Mainnet to make real purchase.',
        {
          icon: '🚨',
        }
      );
    } else {
      setIsMainnet(true);
      toast.dismiss();
    }
  }, [chain]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        setShowTimeoutModal(true);
      },
      15 * 60 * 1000
    );

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-10">
      <div className="max-w-2xl mx-auto">
        {isLoading && <LoadingIndicator />}
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setPhoneNumber={(number: string) =>
            setFormState((prev) => ({ ...prev, phoneNumber: number }))
          }
          setNetworkLogo={setNetworkLogo}
          setDataPlans={setDataPlans}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          setFormState={setFormState}
        />

        <div className="hero-card border-[1px] border-stroke rounded-lg flex flex-col gap-3 p-6 backdrop-blur-xl mt-5">
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
                label="Airtime Amount"
                placeholder="Enter amount"
                min={100}
                max={200000}
                value={formState.amount}
                onChange={handleInputChange}
                disabled={isBtnLoading || isRefunded}
              />
            </>
          )}

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
                  label="Select data plans"
                  options={dataPlans}
                  required={true}
                  disabled={isBtnLoading || isRefunded}
                />
              )}
            </>
          )}

          {activeTab === 'pay-cable' && (
            <>
              <label className="block text-sm font-bold text-white">Select Cable Provider</label>
              <div className="flex gap-4 mb-4">
                {TVProviders.map((provider) => (
                  <button
                    key={provider.code}
                    className={`p-2 ring-1 ring-primary rounded-lg flex items-center gap-3 transition-all cursor-pointer duration-200
                    ${selectedTV?.code === provider?.code ? 'ring-2 bg-primary' : ''}`}
                    onClick={() => {
                      if (isBtnLoading || isRefunded) {
                        return null;
                      }
                      setSelectedTV({
                        name: provider.name,
                        code: provider.code,
                        img: provider.img,
                      });
                    }}
                  >
                    <img
                      src={provider.img}
                      alt={provider.name}
                      className="w-full h-10 object-contain rounded-md"
                    />
                  </button>
                ))}
              </div>

              {isLoading && <span className="text-white">Please wait...</span>}

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
                    label="Select TV plans"
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
                  <label className="block text-sm font-bold text-white">Select Plan Type</label>
                  <div className="flex gap-4 mb-4">
                    {utilityPlans.map((plan) => (
                      <button
                        key={plan.PRODUCT_ID}
                        className={`p-2 ring-2 ring-primary text-white rounded-lg transition-all cursor-pointer
                    ${
                      selectedUtilityPlan?.PRODUCT_ID === plan.PRODUCT_ID
                        ? ' bg-primary text-white'
                        : ''
                    }`}
                        onClick={() => {
                          if (isBtnLoading || isRefunded) {
                            return null;
                          }
                          setSelectedUtilityPlan(plan);
                        }}
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
                    label="Amount"
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
          {starkAmount && address && account && formState?.amount && (
            <div className="text-white text-sm">
              You will pay: {formatSTRKAmount(amountInSTRK)} STRK
            </div>
          )}
        </div>

        <Button
          className="mt-5 mb-10 py-5 w-full flex gap-2 items-center justify-center"
          onClick={handlePayment}
          disabled={isBtnLoading || isRefunded}
        >
          {isBtnLoading || isRefunded ? (
            <>
              <Loader2 className="animate-spin duration-500" color="white" />
              {isRefunded ? 'Please wait, refunding...' : 'Please wait'}
            </>
          ) : (
            'Pay now'
          )}
        </Button>
      </div>
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
