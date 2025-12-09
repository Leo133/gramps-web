import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {ROLES_KEY} from '../decorators/auth.decorator'

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  editor: 3,
  contributor: 2,
  member: 1,
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles) {
      return true
    }

    const {user} = context.switchToHttp().getRequest()
    if (!user) {
      return false
    }

    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0
    const requiredLevel = Math.max(
      ...requiredRoles.map(role => ROLE_HIERARCHY[role] || 0),
    )

    return userRoleLevel >= requiredLevel
  }
}
