import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "./jwt-payload.interface";
import { AuthService } from "./auth.service";
import { User } from "src/users/users.model";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: AuthService) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { email } = payload;
    const user: User = await this.userService.findOne(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
