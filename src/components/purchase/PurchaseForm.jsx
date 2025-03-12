"use client";
import React, { useEffect, useState } from "react";
import InputField from "../form/InputField";
import Tabs from "./Tabs";
import Button from "../form/Button";
import axios from "axios";
import toast from "react-hot-toast";
import SelectField from "../form/SelectField";
import { NetworkProviders } from "@/data/NetworkProviders";
import { TVProviders } from "@/data/TVProviders";
import { motion } from "framer-motion";
import LoadingIndicator from "../loader/LoadingIndicator";

const PurchaseForm = () => {
  const [activeTab, setActiveTab] = useState("buy-data");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [networkLogo, setNetworkLogo] = useState(null);
  const [dataPlans, setDataPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedTV, setSelectedTV] = useState(null);
  const [tVPlans, setTVPlans] = useState(null);
  const [selectedTVPlan, setSelectedTVPlan] = useState("");
  const [IUCNumber, setIUCNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const detectProvider = (number) => {
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setPhoneNumber(value);
      detectProvider(value);
    } else if (name === "amount") {
      setAmount(value);
    } else if (name === "IUCNumber") {
      setIUCNumber(value);
    }
  };

  const getDataPlans = async (network) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-data-plans", { network });
      if (response.data.status) {
        setDataPlans(response?.data?.data[0]?.PRODUCT);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch data plans");
    } finally {
      setIsLoading(false);
    }
  };

  const getTVPlans = async (providerCode) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/get-cable-plans", {
        providerCode,
      });
      if (response.data.status) {
        setTVPlans(response.data.data);
      } else {
        toast.error(response?.msg);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch data plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTV) {
      getTVPlans(selectedTV.name);
    }
  }, [selectedTV]);

  return (
    <div className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-10">
      <div className="max-w-2xl mx-auto">
        {isLoading && (
          <LoadingIndicator />
        )}
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setPhoneNumber={setPhoneNumber}
          setNetworkLogo={setNetworkLogo}
          setDataPlans={setDataPlans}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />

        <div className="hero-card border-[1px] border-stroke rounded-lg flex flex-col gap-3 p-8 backdrop-blur-xl mt-5">
          {activeTab === "buy-data" && (
            <>
              <InputField
                label="Phone Number"
                placeholder="Enter phone number"
                value={phoneNumber}
                name="phoneNumber"
                onChange={handleInputChange}
                networkLogo={networkLogo}
                type="numeric"
                max={11}
              />
              {dataPlans && (
                <SelectField
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
                label="Phone Number"
                placeholder="Enter phone number"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handleInputChange}
                networkLogo={networkLogo}
                max={11}
              />

              <InputField
                type="number"
                name="amount"
                label="Airtime Amount"
                placeholder="Enter amount"
                value={amount}
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
                    className={`p-2 border ring-1 ring-primary rounded-lg flex items-center gap-3 transition-all cursor-pointer duration-200
            ${selectedTV?.code === provider?.code ? "ring-2 bg-primary" : ""}`}
                    onClick={() =>
                      setSelectedTV({
                        name: provider.name,
                        code: provider.code,
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

              {isLoading && (<span className="text-white">Please wait...</span>)}

              {tVPlans && !isLoading && (
                <>
                  <SelectField
                    onChange={(e) => setSelectedTVPlan(e.target.value)}
                    label="Select TV plans"
                    options={tVPlans}
                    required={true}
                    type="TV"
                  />
                  <InputField
                    label="SC/IUC Number"
                    placeholder="Enter SC/IUC Number"
                    name="IUCNumber"
                    value={IUCNumber}
                    type="number"
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={phoneNumber}
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
              <InputField
                label="Utility Type"
                placeholder="Enter utility type"
              />
              <InputField
                label="Account Number"
                placeholder="Enter account number"
              />
            </>
          )}

          {activeTab === "pay-tax" && (
            <>
              <InputField
                label="Utility Type"
                placeholder="Enter utility type"
              />
              <InputField
                label="Account Number"
                placeholder="Enter account number"
              />
            </>
          )}
        </div>

        <Button className="mt-5 py-5 w-full">Pay now</Button>
      </div>
    </div>
  );
};

export default PurchaseForm;
