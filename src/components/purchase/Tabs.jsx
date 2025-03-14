import { Database, PhoneCall, Tv, Lightbulb, Trophy } from "lucide-react";

const Tabs = ({ activeTab, setActiveTab, setIsLoading, isLoading }) => {
  const tabs = [
    { name: "Data", id: "buy-data", icon: <Database className="w-4 h-4 md:w-6 md:h-6" /> },
    { name: "Airtime", id: "buy-airtime", icon: <PhoneCall className="w-4 h-4 md:w-6 md:h-6" /> },
    { name: "Cable", id: "pay-cable", icon: <Tv className="w-4 h-4 md:w-6 md:h-6" /> },
    { name: "Utility", id: "pay-utility", icon: <Lightbulb className="w-4 h-4 md:w-6 md:h-6" /> },
    { name: "Bet", id: "betting", icon: <Trophy className="w-4 h-4 md:w-6 md:h-6" /> },
  ];

  return (
    <div className={`flex justify-between hero-card border-[1px] w-full border-stroke backdrop-blur-xl py-6 px-3 lg:px-7 ${isLoading ? 'rounded-b-lg' : 'rounded-lg'}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex items-center gap-2 md:gap-5 py-2 px-4 text-[10px] md:text-sm font-medium cursor-pointer transition-all duration-100 ${
            activeTab === tab.id
              ? "border-b-2 border-primary text-primary"
              : "text-white"
          }`}
          onClick={() => {
            setIsLoading(false);
            setActiveTab(tab.id);
          }}
        >
          <span className="flex items-center flex-col gap-1 md:gap-2">
            {tab.icon} {tab.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
