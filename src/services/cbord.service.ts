import {
  AppError,
  BadRequestError,
  ErrorCodes,
  UnauthorizedError,
} from '../utils/AppError.js';

const CBORD_BASE_URL = process.env.CBORD_BASE_URL;
if (!CBORD_BASE_URL) {
  throw new Error('CBORD_BASE_URL is not defined in environment variables.');
}

const CBORD_USER_URL = `${CBORD_BASE_URL}/user`;
const CBORD_AUTH_URL = `${CBORD_BASE_URL}/authentication`;
const CBORD_COMMERCE_URL = `${CBORD_BASE_URL}/commerce`;

interface CbordResponse<T> {
  response: T | null;
  exception: {
    message: string;
  } | null;
}

type CbordAccount = {
  accountDisplayName: string;
  balance: number;
  [key: string]: unknown;
};

type CbordTransaction = {
  amount: number;
  tenderId: string;
  accountName: string;
  postedDate: string;
  locationName: string;
  [key: string]: unknown;
};

/**
 * Wrapper for making requests to the CBORD API.
 * Handles network errors and JSON parsing errors.
 */
async function cbordRequest<T>(
  url: string,
  payload: object,
): Promise<CbordResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new AppError(
        `CBORD API request failed with status ${response.status}`,
        response.status,
        ErrorCodes.BAD_REQUEST,
      );
    }

    // Try to parse the JSON response
    try {
      const json = (await response.json()) as CbordResponse<T>;
      return json;
    } catch {
      throw new AppError(
        'Failed to parse CBORD API response.',
        500,
        ErrorCodes.BAD_REQUEST,
      );
    }
  } catch (error) {
    if (error instanceof AppError) throw error;

    // Handle generic fetch errors
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    throw new AppError(
      `Error communicating with CBORD API: ${message}`,
      502,
      ErrorCodes.BAD_REQUEST,
    );
  }
}

/**
 * Checks the CBORD JSON response for an "exception" field.
 * This is based on your old app's `handle_cbord_exception` function.
 */
function handleCbordException<T>(result: CbordResponse<T>): void {
  if (result.exception) {
    const msg = result.exception.message;
    // "Session not found" or "not validated" are 401
    if (msg.includes('not validated') || msg.includes('Session not found')) {
      throw new UnauthorizedError(msg);
    }
    // Other exceptions are user errors
    throw new BadRequestError(msg);
  }

  if (result.response === null) {
    // Probably shouldn't happen if exception is null but just in case
    throw new AppError(
      'CBORD API returned a null response.',
      500,
      ErrorCodes.BAD_REQUEST,
    );
  }
}

/**
 * Calls the CBORD `createPIN` method.
 * This is the one-time setup for linking a device and PIN.
 */
async function createPin(
  deviceId: string,
  pin: string,
  sessionId: string,
): Promise<boolean> {
  const payload = {
    method: 'createPIN',
    params: {
      PIN: pin,
      deviceId: deviceId,
      sessionId: sessionId,
    },
  };

  const result = await cbordRequest<boolean>(CBORD_USER_URL, payload);
  handleCbordException(result);

  return result.response ?? false;
}

/**
 * Calls the CBORD `authenticatePIN` method.
 * Exchanges a deviceId and PIN for a new, valid sessionId.
 */
async function authenticatePin(deviceId: string, pin: string): Promise<string> {
  const payload = {
    method: 'authenticatePIN',
    params: {
      systemCredentials: {
        domain: '',
        userName: 'get_mobile',
        password: 'NOTUSED',
      },
      deviceId: deviceId,
      pin: pin,
    },
  };

  const result = await cbordRequest<string>(CBORD_AUTH_URL, payload);
  handleCbordException(result);

  // If the response is null or not a string throw an error
  if (typeof result.response !== 'string') {
    throw new AppError(
      'Failed to retrieve new sessionId.',
      500,
      ErrorCodes.BAD_REQUEST,
    );
  }

  return result.response;
}

/**
 * Fetches and parses account balances
 */
async function retrieveAccounts(sessionId: string) {
  const payload = {
    method: 'retrieveAccounts',
    params: {
      sessionId: sessionId,
    },
  };

  const result = await cbordRequest<{ accounts: CbordAccount[] }>(
    CBORD_COMMERCE_URL,
    payload,
  );
  handleCbordException(result);

  // Parse accounts (logic from old Django app)
  let brbAccount = null;
  let cityBucksAccount = null;
  let laundryAccount = null;

  for (const account of result.response?.accounts || []) {
    const displayName = account.accountDisplayName || '';
    if (displayName.includes('Big Red Bucks') && !brbAccount) {
      brbAccount = account;
    }
    if (
      displayName.includes('City Bucks') &&
      !displayName.includes('GET') &&
      !cityBucksAccount
    ) {
      cityBucksAccount = account;
    }
    if (displayName.includes('Laundry') && !laundryAccount) {
      laundryAccount = account;
    }
  }

  return {
    brb: brbAccount
      ? {
          name: brbAccount.accountDisplayName,
          balance: brbAccount.balance,
        }
      : null,
    city_bucks: cityBucksAccount
      ? {
          name: cityBucksAccount.accountDisplayName,
          balance: cityBucksAccount.balance,
        }
      : null,
    laundry: laundryAccount
      ? {
          name: laundryAccount.accountDisplayName,
          balance: laundryAccount.balance,
        }
      : null,
  };
}

/**
 * Fetches and parses transaction history.
 */
async function retrieveTransactionHistory(sessionId: string) {
  const payload = {
    method: 'retrieveTransactionHistoryWithinDateRange',
    params: {
      paymentSystemType: 0,
      queryCriteria: {
        maxReturnMostRecent: 100, // Limit to 100 most recent for now
      },
      sessionId: sessionId,
    },
  };

  const result = await cbordRequest<{ transactions: CbordTransaction[] }>(
    CBORD_COMMERCE_URL,
    payload,
  );
  handleCbordException(result);

  return (result.response?.transactions || []).map((txn) => ({
    amount: txn.amount,
    tenderId: txn.tenderId,
    accountName: txn.accountName,
    date: txn.postedDate,
    location: txn.locationName,
  }));
}

export const cbordService = {
  createPin,
  authenticatePin,
  retrieveAccounts,
  retrieveTransactionHistory,
};
