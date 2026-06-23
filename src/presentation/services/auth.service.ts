import { markAsUntransferable } from "node:worker_threads";
import { bcryptAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  RegisterUserDto,
  UserEntity,
  LoginUserDto,
} from "../../domain";

export class AuthService {
  //DI
  constructor() {}

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
}
