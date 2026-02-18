import { Router, type Request, type Response } from 'express';

const ITUNES_LOOKUP_URL =
  'https://itunes.apple.com/lookup?bundleId=org.cuappdev.eatery';

interface iTunesLookupResult {
  resultCount: number;
  results: Array<{ version?: string }>;
}

async function fetchAppVersion(): Promise<string> {
  const response = await fetch(ITUNES_LOOKUP_URL);
  const data = (await response.json()) as iTunesLookupResult;

  if (!response.ok || !data.results?.length) {
    throw new Error('Failed to fetch app version from App Store');
  }

  const version = data.results[0]?.version;
  if (!version) {
    throw new Error('Version not found in App Store response');
  }

  return version;
}

export const versionRouter = Router();

versionRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const version = await fetchAppVersion();
    res.json({ version });
  } catch (error) {
    res.status(503).json({
      error: 'Unable to fetch app version',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
