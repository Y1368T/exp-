import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthCredentialsDto, CreateUserDto } from "./dto/auth-credentials.dto";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./jwt-payload.interface";
import { InjectModel } from "@nestjs/sequelize";
import * as jwt from "jsonwebtoken";
import { MailService } from "../mail/mail.service";
import { User } from "src/users/users.model";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // private methods
  //------------------------------------------------------------------------//
  private generateVerificationToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '2h', // Default to 2 hours if not set
    });
  }

  //------------------------------------------------------------------------//

  async getProfile(user: User): Promise<User> {
    return this.userModel.findByPk(user.id, { raw: true });
  }

  async signUp(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    const { email, password, name } = createUserDto;
    const user = await this.userModel.findOne({
      where: { email: email.toLowerCase() },
    });
    if (user && user.isVerified) {
      throw new ConflictException("Email already exists");
    }
    if (user && !user.isVerified) {
      throw new UnauthorizedException(
        "An account already exists with this email. Please verify it.",
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT token with expiration time
    const payload: JwtPayload = { id: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken: string = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '2h', // Default to 2 hours if not set
    });
    console.log('Generated Access Token:', accessToken);
    return { accessToken };
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.userModel.findOne({
      where: { email },
      paranoid: false,
    });
    if (user && user.isSoftDeleted())
      throw new ForbiddenException(
        "Your account has been suspended, please contact support.",
      );
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { id: user.id, email, role: user.role };
      const accessToken: string = this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRATION || '2h', // Default to 2 hours if not set
      });
      return { accessToken };
    }
    if (user && !user.isVerified) {
      throw new UnauthorizedException("Please verify your email");
    } else {
      throw new UnauthorizedException("Invalid email or password");
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ where: { email } });
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userModel.findOne({ where: { email } });

    if (user && user.isVerified) {
      const passwordResetToken = this.generateVerificationToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const resetPasswordLink = process.env.APP_BASE_URL + "/auth/reset-password/" + passwordResetToken;

      const mailOptions = {
        from: process.env.MAILTRAP_SENDER_EMAIL,
        to: email,
        subject: "Your password reset token  (valid for 2 hours)",
        message: "Write PUT request to this URL to reset your password",
        html: `
          <center>
            <h2>Password reset link is as follows:</h2> <br>
            <h4>Send a PUT request to this URL to reset your password</h4> <br>
            <a href="${resetPasswordLink}">${resetPasswordLink}</a>
          </center>
        `,
      };
      await this.mailService.sendEmail(mailOptions);

      await user.update({ passwordResetToken });
      return "A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.";
    } else
      throw new BadRequestException(
        "Invalid email address or account not verified",
      );
  }

  async resetPassword(token: string, password: string): Promise<string> {
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as JwtPayload;

      const { id, email } = decodedToken;

      const user = await this.userModel.findOne({
        where: { id, email, isVerified: true },
      });
      if (!user) throw new BadRequestException("Something went wrong");
      if (!user.passwordResetToken || user.passwordResetToken !== token) {
        throw new UnauthorizedException("Invalid reset password token");
      }

      // Update user's password
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      await user.save();

      return "Your password has been reset successfully";
    } catch (error) {
      throw new UnauthorizedException("Invalid reset password token");
    }
  }

  async verifyEmail(token: string): Promise<string> {
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as JwtPayload;

      const user = await this.userModel.findOne({
        where: {
          id: decodedToken.id,
          email: decodedToken.email,
          isVerified: false,
        },
      });

      if (!user) {
        throw new BadRequestException("Email already verified");
      }

      if (user) {
        user.isVerified = true; // Mark the user as verified
        await user.save();
      }
      return "Your email has been verified";
    } catch (error) {
      throw new BadRequestException("Invalid verification token");
    }
  }
}
