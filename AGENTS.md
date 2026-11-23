# eatery-blue-backend

- Run `npm run check` after edits.
- Validate input with Zod through `validateRequest`.
- Throw `AppError` subclasses from `src/utils/AppError.ts`. Pass unexpected errors to `next(error)`.
- Add new environment variables to `.env.example`. Do not commit or log secrets.
