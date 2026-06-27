import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SseJwtGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (req.query?.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    return req;
  }
}
