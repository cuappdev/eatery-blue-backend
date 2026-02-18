import { type Request, type Response, Router } from 'express';

import { ITUNES_LOOKUP_URL } from '../constants.js';
import { BadGatewayError } from './AppError.js';

interface iTunesLookupResult {
  resultCount: number;
  results: Array<{ version?: string }>;
}

async function fetchAppVersion(): Promise<string> {
  const response = await fetch(ITUNES_LOOKUP_URL);
  const data = (await response.json()) as iTunesLookupResult;

  if (!response.ok || !data.results?.length) {
    throw new BadGatewayError('Failed to fetch app version from App Store');
  }

  const version = data.results[0]?.version;
  if (!version) {
    throw new BadGatewayError('Version not found in App Store response');
  }

  return version;
}

export const versionRouter = Router();

versionRouter.get('/', async (_req: Request, res: Response) => {
  const version = await fetchAppVersion();
  return res.json({ version });
});
