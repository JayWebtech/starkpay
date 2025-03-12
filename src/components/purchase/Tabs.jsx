import { Database, PhoneCall, Tv, Lightbulb, FileText } from "lucide-react";

const Tabs = ({ activeTab, setActiveTab, setPhoneNumber, setNetworkLogo, setDataPlans, setIsLoading, isLoading }) => {
  const tabs = [
    { name: "Buy data", id: "buy-data", icon: <Database size={26} /> },
    { name: "Buy airtime", id: "buy-airtime", icon: <PhoneCall size={26} /> },
    { name: "Pay Cable bills", id: "pay-cable", icon: <Tv size={26} /> },
    { name: "Pay utility bills", id: "pay-utility", icon: <Lightbulb size={26} /> },
    { name: "Tax payment", id: "pay-tax", icon: <FileText size={26} /> },
  ];

  return (
    <div className={`flex justify-center hero-card border-[1px] w-full border-stroke backdrop-blur-xl py-6 px-2 ${isLoading ? 'rounded-b-lg' : 'rounded-lg'}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex items-center gap-5 py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-100 ${
            activeTab === tab.id
              ? "border-b-2 border-primary text-primary"
              : "text-white"
          }`}
          onClick={() => {
            setIsLoading(false)
            setActiveTab(tab.id)
          }}
        >
          <span className="flex items-center flex-col gap-2">
            {tab.icon} {tab.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
