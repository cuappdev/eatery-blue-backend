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
    message?: string;
  } | null;
}

type CbordAccount = {
  accountDisplayName: string;
  balance: number;
  accountType: number;
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
    const msg = result.exception.message ?? 'Unknown CBORD error';
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
 * Calls the CBORD `retrieve` method to get the user's CBORD id.
 */
async function retrieveUserId(sessionId: string): Promise<string> {
  const payload = {
    method: 'retrieve',
    params: {
      sessionId: sessionId,
    },
  };

  const result = await cbordRequest<{ id: string }>(CBORD_USER_URL, payload);
  handleCbordException(result);

  return result.response!.id;
}

/**
 * Calls the CBORD `retrieveAccountsByUser` method.
 * Returns the same accounts as `retrieveAccounts`, plus the user's plan name.
 */
async function retrieveAccountsByUser(sessionId: string, userId: string) {
  const payload = {
    method: 'retrieveAccountsByUser',
    params: {
      sessionId: sessionId,
      userId: userId,
    },
  };

  const result = await cbordRequest<{
    accounts: CbordAccount[];
    planName: string | null;
  }>(CBORD_COMMERCE_URL, payload);
  handleCbordException(result);

  return {
    accounts: result.response?.accounts || [],
    planName: result.response?.planName ?? null,
  };
}

/**
 * Looks up the meal plan through `retrieve` + `retrieveAccountsByUser` when
 * `retrieveAccounts` does not include one. Returns null if this fails.
 */
async function retrieveMealSwipesFallback(
  sessionId: string,
): Promise<MealSwipes | null> {
  try {
    const userId = await retrieveUserId(sessionId);
    const { accounts, planName } = await retrieveAccountsByUser(
      sessionId,
      userId,
    );
    return selectMealSwipes(accounts, planName);
  } catch (error) {
    console.error('Meal swipes fallback failed:', error);
    return null;
  }
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

  let mealSwipes = selectMealSwipes(result.response?.accounts || []);
  if (!mealSwipes) {
    mealSwipes = await retrieveMealSwipesFallback(sessionId);
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
    meal_swipes: mealSwipes,
  };
}

/** CBORD `accountType` for meal plan (swipe) accounts. */
const MEAL_PLAN_ACCOUNT_TYPE = 1;

export type MealSwipes = {
  name: string;
  plan: MealPlanType;
  balance: number | null;
};

/**
 * Picks the user's meal plan from a list of CBORD accounts.
 * Weekly and semester plans take priority over unlimited plans, and among
 * them the one with the lowest remaining balance is returned. Unlimited plans
 * always have a null balance. Returns null if no meal plan is found.
 */
export function selectMealSwipes(
  accounts: CbordAccount[],
  planName?: string | null,
): MealSwipes | null {
  const mealPlans = accounts.filter(
    (acc: CbordAccount) => acc.accountType === MEAL_PLAN_ACCOUNT_TYPE,
  );

  let lowest: MealSwipes | null = null;
  let unlimited: MealSwipes | null = null;

  for (const mealPlan of mealPlans) {
    let plan = classifyMealPlan(mealPlan.accountDisplayName);
    let name = mealPlan.accountDisplayName;

    // Fall back to the plan name from retrieveAccountsByUser
    if (!plan && planName) {
      plan = classifyMealPlan(planName);
      name = planName;
    }
    if (!plan) continue;

    if (plan === 'unlimited') {
      unlimited ??= { name, plan, balance: null };
      continue;
    }

    const balance = mealPlan.balance;
    if (!Number.isFinite(balance)) continue;

    if (!lowest || balance < lowest.balance!) {
      lowest = { name, plan, balance };
    }
  }

  return lowest ?? unlimited;
}

export type MealPlanType = 'unlimited' | 'weekly' | 'semester';

/**
 * Keywords that identify each meal plan, checked in order against the
 * normalized account name. More specific keywords must come first
 * (e.g. "house affiliate" is weekly, but "house meal plan" is unlimited).
 *
 * Plans without swipes (Just Bucks, the Graduate and Professional Student
 * plan, MealChoice, MealChoice Encore) are intentionally not listed, so they
 * classify as null.
 */
const MEAL_PLAN_KEYWORDS: [keyword: string, plan: MealPlanType][] = [
  ['house affiliate', 'weekly'],
  ['house meal plan', 'unlimited'],
  ['unlimited', 'unlimited'],
  ['traditional', 'weekly'],
  ['choice', 'weekly'],
  ['basic', 'weekly'],
  ['collegetown', 'weekly'],
  ['off campus', 'semester'],
  ['flex', 'semester'],
  ['supplemental', 'semester'],
  ['sfl', 'semester'],
];

/**
 * Determines the meal plan type from a CBORD account display name or plan
 * name (e.g. "01b House Meal Plan"). Returns null if the name does not match
 * a known meal plan.
 */
export function classifyMealPlan(name: string): MealPlanType | null {
  // Lowercase and replace punctuation with spaces so "Off-Campus Value"
  // matches "off campus", then pad so keywords only match whole words.
  const normalized = ` ${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

  for (const [keyword, plan] of MEAL_PLAN_KEYWORDS) {
    if (normalized.includes(` ${keyword} `)) {
      return plan;
    }
  }
  return null;
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
