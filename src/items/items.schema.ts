import { z } from 'zod';

export const getItemPreferenceCountsSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          itemName: z.string().nonempty('Item name is required'),
          cornellId: z.number().int('cornellId must be an integer'),
        }),
      )
      .min(1)
      .max(200),
  }),
});
