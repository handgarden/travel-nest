import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigProperties } from 'src/config/configuration';
import { JwtModuleOptions } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { Role } from 'src/member/enum/Role';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtModuleOptions>(
        ConfigProperties.JwtModuleOptions,
      ).secret,
    });
  }

  validate(payload: JwtPayload): JwtMemberDto {
    const id = parseInt(payload.sub.toString());
    const role = Role[payload.role];
    return new JwtMemberDto(id, payload.nickname, role);
  }
}
