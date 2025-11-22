import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // First check if user is authenticated
    const isAuthenticated = super.canActivate(context);

    if (isAuthenticated) {
      const req = context.switchToHttp().getRequest();
      const user = req.user;

      // Check if user has admin role
      if (!user.roles || !user.roles.includes('admin')) {
        throw new ForbiddenException('ADMIN_ACCESS_REQUIRED');
      }

      return true;
    }

    return false;
  }
}