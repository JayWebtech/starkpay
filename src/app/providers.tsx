"use client";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { ReactNode } from "react";
import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { Connector } from "@starknet-react/core";
import { ArgentMobileConnector } from "starknetkit/argentMobile"
import { StarknetkitConnector } from "starknetkit";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const connectors = [
    new InjectedConnector({
      options: { id: "argentX", name: "Argent X" },
    }),
    new InjectedConnector({
      options: { id: "braavos", name: "Braavos" },
    }),
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
    ArgentMobileConnector.init({
      options: {
        dappName: 'Starkpay',
        url: "https://starkpay-seven.vercel.app",
        projectId: "93392c1b1fdd1f4987f02543117520bf"
      }
    }) as StarknetkitConnector,
  ];

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors as Connector[]}
      explorer={voyager}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}
