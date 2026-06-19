import { UserModel } from "../../data";
import { CustomError, RegisterUserDto, UserEntity } from "../../domain";

export class AuthService {
  //DI
  constructor() {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    //always use try catch to  save in database
    try {
      const user = new UserModel(registerUserDto);
      await user.save();
      //Encripter la contraseña

      //JWT <--- para mantener la autenticacion del usuario

      //Email de confirmacion
      const { password, ...userEntity } = UserEntity.fromObject(user);

      return {
        user: userEntity,
        token: "ABC",
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
