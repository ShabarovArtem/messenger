import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserPayload } from '../types/auth.interface';

export const GetCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user as UserPayload) ?? null;
  },
);
