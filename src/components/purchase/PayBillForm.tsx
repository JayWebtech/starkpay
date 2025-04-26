"use client";
import React, { useEffect, useState, useCallback } from "react";
import InputField from "../form/InputField";
import Tabs from "./Tabs";
import Button from "../form/Button";
import axios from "axios";
import toast from "react-hot-toast";
import SelectField from "../form/SelectField";
import { NetworkProviders } from "@/data/NetworkProviders";
import { TVProviders } from "@/data/TVProviders";
import LoadingIndicator from "../loader/LoadingIndicator";
import { ElectricityProviders } from "@/data/ElectricityCompany";
import { DataPlan, TVPlan, UtilityPlan, TVProvider } from "@/types/api";
import { useAccount } from "@starknet-react/core";

interface FormState {
  phoneNumber: string;
  amount: string;
  IUCNumber: string;
  meterNumber: string;
}

const PayBillForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("buy-data");
  const [formState, setFormState] = useState<FormState>({
    phoneNumber: "",
    amount: "",
    IUCNumber: "",
    meterNumber: "",
  });
  const [networkLogo, setNetworkLogo] = useState<string | null>(null);
  const [dataPlans, setDataPlans] = useState<DataPlan[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTV, setSelectedTV] = useState<TVProvider | null>(null);
  const [tVPlans, setTVPlans] = useState<TVPlan[] | null>(null);
  const [selectedTVPlan, setSelectedTVPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null);
  const [utilityPlans, setUtilityPlans] = useState<UtilityPlan[]>([]);
  const [selectedUtilityPlan, setSelectedUtilityPlan] =
    useState<UtilityPlan | null>(null);
  const { address } = useAccount();

  const detectProvider = useCallback(
    (number: string) => {
      if (number.length >= 4) {
        const prefix = number.slice(0, 4);
        const provider = NetworkProviders.find((p) =>
          p.prefixes.includes(prefix)
        );

        if (provider) {
          setNetworkLogo(provider.logo);
          if (!dataPlans && activeTab === "buy-data") {
            getDataPlans(provider.name);
          }
        } else {
          toast.error("You entered an invalid number");
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

      if (name === "phoneNumber") {
        detectProvider(value);
      }
    },
    [detectProvider]
  );

  const getDataPlans = useCallback(async (network: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-data-plans", { network });
      if (response.data.status) {
        setDataPlans(response?.data?.data[0]?.PRODUCT);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch data plans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTVPlans = useCallback(async (providerCode: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-cable-plans", {
        providerCode,
      });
      if (response.data.status) {
        setTVPlans(response.data.data);
      } else {
        toast.error(response?.data?.msg || "Failed to fetch TV plans");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch TV plans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUtilityPlans = useCallback(async (providerCode: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-utility-plans", {
        providerCode,
      });

      if (response.data.status) {
        setUtilityPlans(response.data.data);
        setSelectedUtilityPlan(null);
      } else {
        toast.error("No plans found for this provider");
        setUtilityPlans([]);
      }
    } catch (error: any) {
      toast.error(error?.msg || "Failed to fetch electricity plan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePayment = useCallback(async () => {
    if (!address) {
      toast.error("Please connect your wallet to proceed");
      return;
    }
    if (!formState.phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    if (formState.phoneNumber.length < 11) {
      toast.error("Phone number must be 11 digits");
      return;
    }

    if(activeTab === "buy-data") {

    }



  }, [formState, address]);

  useEffect(() => {
    if (selectedTV) {
      getTVPlans(selectedTV.name);
    }
  }, [selectedTV, getTVPlans]);

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
        />

        <div className="hero-card border-[1px] border-stroke rounded-lg flex flex-col gap-3 p-8 backdrop-blur-xl mt-5">
          {activeTab === "buy-data" && (
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
              />
              {dataPlans && (
                <SelectField
                  id="dataPlan"
                  value={selectedPlan || ""}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  label="Select data plans"
                  options={dataPlans}
                  required={true}
                />
              )}
            </>
          )}

          {activeTab === "buy-airtime" && (
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
              />

              <InputField
                id="amount"
                type="number"
                name="amount"
                label="Airtime Amount"
                placeholder="Enter amount"
                value={formState.amount}
                onChange={handleInputChange}
              />
            </>
          )}

          {activeTab === "pay-cable" && (
            <>
              <label className="block text-sm font-bold text-white">
                Select Cable Provider
              </label>
              <div className="flex gap-4 mb-4">
                {TVProviders.map((provider) => (
                  <button
                    key={provider.code}
                    className={`p-2 ring-1 ring-primary rounded-lg flex items-center gap-3 transition-all cursor-pointer duration-200
                    ${
                      selectedTV?.code === provider?.code
                        ? "ring-2 bg-primary"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedTV({
                        name: provider.name,
                        code: provider.code,
                        img: provider.img,
                      })
                    }
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
                    onChange={(e) => setSelectedTVPlan(e.target.value)}
                    label="Select TV plans"
                    options={tVPlans}
                    required={true}
                    type="TV"
                  />
                  <InputField
                    id="iucNumber"
                    label="SC/IUC Number"
                    placeholder="Enter SC/IUC Number"
                    name="IUCNumber"
                    value={formState.IUCNumber}
                    type="number"
                    onChange={handleInputChange}
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
                  />
                </>
              )}
            </>
          )}

          {activeTab === "pay-utility" && (
            <>
              <SelectField
                id="utilityProvider"
                value={selectedUtility || ""}
                label="Electricity Provider"
                options={ElectricityProviders}
                onChange={(e) => {
                  setSelectedUtility(e.target.value);
                  getUtilityPlans(e.target.value);
                }}
                type="electric"
              />
              {selectedUtility && utilityPlans.length > 0 && (
                <>
                  <label className="block text-sm font-bold text-white">
                    Select Plan Type
                  </label>
                  <div className="flex gap-4 mb-4">
                    {utilityPlans.map((plan) => (
                      <button
                        key={plan.PRODUCT_ID}
                        className={`p-2 ring-2 ring-primary text-white rounded-lg transition-all cursor-pointer
                    ${
                      selectedUtilityPlan?.PRODUCT_ID === plan.PRODUCT_ID
                        ? " bg-primary text-white"
                        : ""
                    }`}
                        onClick={() => setSelectedUtilityPlan(plan)}
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
                  />
                </>
              )}
            </>
          )}
        </div>

        <Button className="mt-5 py-5 w-full" onClick={handlePayment}>
          Pay now
        </Button>
      </div>
    </div>
  );
};

export default PayBillForm;
