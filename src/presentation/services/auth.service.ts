import { markAsUntransferable } from "node:worker_threads";
import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  RegisterUserDto,
  UserEntity,
  LoginUserDto,
} from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {
  //DI
  constructor(private readonly emailService: EmailService) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    //always use try catch to  save in database
    try {
      const user = new UserModel(registerUserDto);

      //Encripter la contraseña
      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();
      //JWT <--- para mantener la autenticacion del usuario

      //Email de confirmacion
      await this.sendEmailValidationLink(user.email); //email is already validated

      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({
        email: user.email,
      });

      if (!token) {
        throw CustomError.internalServer("Error while creating JWT");
      }

      return {
        user: userEntity,
        token,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const userRegistered = await UserModel.findOne({
      email: loginUserDto.email,
    });
    if (!userRegistered)
      throw CustomError.badRequest(
        `There is not user registered with email ${loginUserDto.email} `,
      );

    const isMatch = bcryptAdapter.compare(
      loginUserDto.password,
      userRegistered.password,
    );

    const { password, ...userEntity } = UserEntity.fromObject(userRegistered);

    const token = await JwtAdapter.generateToken({
      id: userRegistered.id,
      email: userRegistered.email,
    });

    if (!token) {
      throw CustomError.internalServer("Error while creating JWT");
    }

    if (isMatch) {
      return {
        user: userEntity,
        token,
      };
    }

    throw CustomError.internalServer("Password is not valid ");
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internalServer("Error getting token");
    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

    const html = `
      <h1>Validate your email</h1>
      <p>Click on the following link to validate your email</p>
      <a href="${link}">Validate your email: ${email}</a>
    `;
    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);

    if (!isSent) {
      throw CustomError.internalServer("Error sending email");
    }
    return true;
  };

  validateEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.badRequest("Invalid token");

    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServer("Email not in token");

    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internalServer("Email not exists");

    user.emailValidated = true;
    await user.save();
  };
}
