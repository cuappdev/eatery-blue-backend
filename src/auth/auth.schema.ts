import { z } from 'zod';

export const verifyFirebaseTokenSchema = z.object({
  body: z.object({
    firebaseToken: z.string().nonempty('Firebase token is required'),
  }),
});
