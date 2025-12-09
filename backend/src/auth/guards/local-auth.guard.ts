import {Injectable, AuthGuard} from '@nestjs/passport'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
