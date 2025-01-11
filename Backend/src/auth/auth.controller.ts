import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  AuthCredentialsDto,
  CreateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth-credentials.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/users/users.model";
import { GetUser } from "./get-user.decorator";
import { plainToClass } from "class-transformer";
import { UserEntity } from "src/entites/serialized-user.entity";

class AccessToken {
  @ApiProperty({ description: "JWT token for authentication" })
  accessToken: string;
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("/profile")
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    type: User,
  })
  async getProfile(@GetUser() user: User): Promise<UserEntity> {
    const userProfile = await this.authService.getProfile(user);
    const serializedUser = plainToClass(UserEntity, userProfile);
    return serializedUser;
  }

  @Post("/signup")
  @ApiOperation({ summary: "Sign up a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: "The user has been successfully signed up.",
    type: AccessToken,
  })
  @ApiConflictResponse({ description: "Email already exists" })
  @ApiUnauthorizedResponse({
    description: "An account already exists with this email. Please verify it.",
  })
  signUp(@Body() authCredentialsDto: CreateUserDto): Promise<{ accessToken: string }> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post("/signin")
  @ApiOperation({ summary: "Log in" })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully logged in.",
    type: AccessToken,
  })
  @ApiUnauthorizedResponse({
    description: "Please verify your email",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid email or password",
  })
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get("/verify/email/:token")
  @ApiOperation({ summary: "Verify email" })
  @ApiParam({ name: "token", required: true })
  @ApiResponse({ status: 200, description: "Email has been verified." })
  async verifyEmail(@Param("token") token: string): Promise<string> {
    return this.authService.verifyEmail(token);
  }

  @Post("/forgot-password")
  @ApiOperation({ summary: "Forgot password" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password reset email has been sent.",
  })
  @ApiBadRequestResponse({
    description: "Invalid email address or account not verified",
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post("/reset-password/:token")
  @ApiOperation({ summary: "Reset password" })
  @ApiParam({ name: "token", required: true })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password has been successfully reset.",
  })
  @ApiBadRequestResponse({ description: "Email already verified" })
  @ApiBadRequestResponse({ description: "Invalid verification token" })
  async resetPassword(
    @Param("token") token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    return this.authService.resetPassword(token, resetPasswordDto.password);
  }
}
