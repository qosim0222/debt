import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let request: Request = context.switchToHttp().getRequest();
    let { token } = request.body;
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      let data = this.jwt.verify(token, {
         secret: process.env.REFKEY });
      request['user'] = data;
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}

