import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  addTeamMembersSchema,
  teamMemberParamsSchema,
  teamParamsSchema,
  updateTeamSchema,
} from './team.schema.js';
import {
  addTeamMembers,
  deleteTeam,
  getTeam,
  removeTeamMember,
  updateTeam,
} from './teamController.js';

const router = Router();

// Team routes that don't require course offering context
router.get('/:teamId', validateRequest(teamParamsSchema), getTeam);

router.put(
  '/:teamId',
  validateRequest(teamParamsSchema),
  validateRequest(updateTeamSchema),
  updateTeam,
);

router.delete('/:teamId', validateRequest(teamParamsSchema), deleteTeam);

router.post(
  '/:teamId/members',
  validateRequest(teamParamsSchema),
  validateRequest(addTeamMembersSchema),
  addTeamMembers,
);

router.delete(
  '/:teamId/members/:userId',
  validateRequest(teamMemberParamsSchema),
  removeTeamMember,
);

export default router;
