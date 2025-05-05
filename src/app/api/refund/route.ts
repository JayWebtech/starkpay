import { NextRequest } from 'next/server';
import { RpcProvider, shortString } from 'starknet';
import * as passworder from '@metamask/browser-passworder';
import { Account, Contract } from 'starknet';

export async function POST(req: NextRequest): Promise<Response> {
  let isMainet: boolean;
  let refcode: string;

  try {
    const body = await req.text();
    console.log('Received request body:', body);
    
    if (!body) {
      throw new Error('Empty request body');
    }

    const parsedBody = JSON.parse(body);
    isMainet = parsedBody.isMainet;
    refcode = parsedBody.refcode;

    if (typeof isMainet !== 'boolean' || typeof refcode !== 'string') {
      throw new Error('Invalid request parameters');
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
    console.log('Initializing provider...');
    const provider = new RpcProvider({
      nodeUrl: `${isMainet ? process.env.NEXT_PUBLIC_MAINET_RPC : process.env.NEXT_PUBLIC_SEPOLIA_RPC}`,
    });

    console.log('Checking environment variables...');
    const salt = process.env.NEXT_PRIVATE_STARKPAY_SALT;
    const encryptedKey = process.env.NEXT_PRIVATE_STARKPAY_ENCRYPTED_PRIVATE_KEY;
    
    if (!salt || !encryptedKey) {
      throw new Error('Missing required environment variables for private key decryption');
    }

    console.log('Attempting to decrypt private key...');
    try {
        console.log(atob(encryptedKey))
      const decrypted = await passworder.decrypt(
        salt,
        atob(encryptedKey)
      );
      
      if (!decrypted) {
        throw new Error('Decryption failed - no data returned');
      }

      // connect your account. To adapt to your own account:
      const privateKey0 = decrypted;
      const account0Address = process.env.NEXT_PRIVATE_STARKPAY_ACCOUNT_ADDRESS || '';
      
      if (!account0Address) {
        throw new Error('Missing account address environment variable');
      }
      
      console.log('Creating account...');
      const account0 = new Account(provider, account0Address, privateKey0 as string);

      // Connect the deployed Test contract in Testnet
      const testAddress = process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS;
      console.log('Test contract address:', testAddress);

      // read abi of Test contract
      console.log('Fetching contract ABI...');
      const { abi: testAbi } = await provider.getClassAt(testAddress as string);
      if (testAbi === undefined) {
        throw new Error('no abi.');
      }
      console.log('Creating contract instance...');
      const myTestContract = new Contract(testAbi, testAddress as string, provider);

      // Connect account with the contract
      myTestContract.connect(account0);

      console.log('Preparing refund call...');
      const myCall = myTestContract.populate('refund', [shortString.encodeShortString(refcode)]);
      console.log('Executing refund transaction...');
      const res = await myTestContract.refund(myCall.calldata);
      console.log('Waiting for transaction...');
      await provider.waitForTransaction(res.transaction_hash);

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
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
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
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
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
