import { NextRequest } from 'next/server';
import { RpcProvider, shortString, constants, RPC, num, Call } from 'starknet';
import * as passworder from '@metamask/browser-passworder';
import { Account, Contract } from 'starknet';
import { getSupportedTokens, getContractAddress } from '@/constants/token';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest): Promise<Response> {
  let isMainet: boolean;
  let refcode: string;
  let amountInSTRK: string;

  let SUPPORTED_TOKENS;
  let CONTRACT_ADDRESS;

  try {
    const body = await req.text();
    
    if (!body) {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Empty request body',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const parsedBody = JSON.parse(body);
    isMainet = parsedBody.isMainet;
    refcode = parsedBody.refcode;
    amountInSTRK = parsedBody.amountInSTRK;

    SUPPORTED_TOKENS = getSupportedTokens(isMainet);
    CONTRACT_ADDRESS = getContractAddress(isMainet);

    if (typeof isMainet !== 'boolean' || typeof refcode !== 'string') {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Invalid request parameters',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error parsing request:', error);
    return new Response(
      JSON.stringify({
        status: false,
        message: `Error parsing request: ${error.message}`,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Check transaction status before proceeding
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('refcode', refcode)
      .single();

    if (txError) {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Transaction not found',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (transaction.refunded) {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Transaction already refunded',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (transaction.status !== 'failed') {
      return new Response(
        JSON.stringify({
          status: false,
          message: 'Only failed transactions can be refunded',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const provider = new RpcProvider({
      nodeUrl: `${isMainet ? process.env.NEXT_PUBLIC_MAINET_RPC : process.env.NEXT_PUBLIC_SEPOLIA_RPC}`,
    });

    console.log('Checking environment variables...');
    const salt = process.env.NEXT_PRIVATE_STARKPAY_SALT;
    const encryptedKey = process.env.NEXT_PRIVATE_STARKPAY_ENCRYPTED_PRIVATE_KEY;

    if (!salt || !encryptedKey) {
        return new Response(
          JSON.stringify({
            status: false,
            message: 'An expected error occurred, please try again later',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }

    try {
      console.log(atob(encryptedKey));
      const decrypted = await passworder.decrypt(salt, atob(encryptedKey));

      if (!decrypted) {
        return new Response(
          JSON.stringify({
            status: false,
            message: 'Decryption failed - no data returned',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // connect your account. To adapt to your own account:
      const privateKey0 = decrypted;
      const account0Address = process.env.NEXT_PRIVATE_STARKPAY_ACCOUNT_ADDRESS || '';

      if (!account0Address) {
        return new Response(
          JSON.stringify({
            status: false,
            message: 'Missing account address environment variable',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Creating account...');
      const account0 = new Account(
        provider,
        account0Address,
        privateKey0 as string,
        undefined,
        constants.TRANSACTION_VERSION.V3
      );

      // const amountInWei = BigInt(Math.floor(Number(amountInSTRK) * 1e18));
      // const pre_amount = Number(amountInWei);
      const amount = BigInt(amountInSTRK || 0);
      const low = amount & BigInt('0xffffffffffffffffffffffffffffffff');
      const high = amount >> BigInt(128);

      const calls: Call[] = [
        {
          entrypoint: 'approve',
          contractAddress: SUPPORTED_TOKENS.STRK.address,
          calldata: [CONTRACT_ADDRESS as `0x${string}`, low.toString(), high.toString()],
        },
        {
          entrypoint: 'refund',
          contractAddress: CONTRACT_ADDRESS as `0x${string}`,
          calldata: [shortString.encodeShortString(refcode)],
        },
      ];

      const maxQtyGasAuthorized = 1800n;
      const maxPriceAuthorizeForOneGas = 20n * 10n ** 12n;
      console.log('max authorized cost =', maxQtyGasAuthorized * maxPriceAuthorizeForOneGas, 'FRI');
      const { transaction_hash: txH } = await account0.execute(calls, {
        version: 3,
        maxFee: 10 ** 15,
        feeDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
        tip: 10 ** 13,
        paymasterData: [],
        resourceBounds: {
          l1_gas: {
            max_amount: num.toHex(maxQtyGasAuthorized),
            max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
          },
          l2_gas: {
            max_amount: num.toHex(0),
            max_price_per_unit: num.toHex(0),
          },
        },
      });
      const txR = await provider.waitForTransaction(txH);
      if (txR.isSuccess()) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            refunded: true,
            status: 'failed'
          })
          .eq('refcode', refcode);

          console.log(updateError)

          return new Response(
            JSON.stringify({
              status: true,
              message: 'Refund triggered successfully',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
      }

      return new Response(
        JSON.stringify({
          status: false,
          message: 'Refund failed. Our team will be notified',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      let userMessage = 'Error while refunding, our team will be notified';

      if (error.message && error.message.includes('Invalid reference code')) {
        userMessage = 'Invalid reference code';
      }
      if (error.message && error.message.includes('Transaction already refunded')) {
        userMessage = 'Transaction already refunded';
      }

      if (error.message && error.message.includes('Unauthorized caller')) {
        userMessage = 'Unauthorized caller';
      }

      return new Response(
        JSON.stringify({
          status: false,
          message: userMessage,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    let userMessage = 'Error while refunding, our team will be notified';

    if (error.message && error.message.includes('Invalid reference code')) {
      userMessage = 'Invalid reference code';
    }

    return new Response(
      JSON.stringify({
        status: false,
        message: userMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
