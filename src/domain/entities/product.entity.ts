import { CustomError } from "../errors/custom.error";
import { UserEntity } from "./user.entity"; // Importamos UserEntity

export class ProductEntity {
  constructor(
    public id: string,
    public name: string,
    public available: boolean,
    public price: number,
    public description: string,
    public user: string, // La entidad referencia a la entidad de usuario
    public category: string, // Aquí podríamos referenciar a CategoryEntity si existiera
  ) {}

  static fromObject(object: { [key: string]: any }): ProductEntity {
    const { id, _id, name, available, price, description, user, category } =
      object;

    if (!_id && !id) throw CustomError.badRequest("Missing id");
    if (!name) throw CustomError.badRequest("Missing name");
    if (available === undefined)
      throw CustomError.badRequest("Missing available");
    if (price === undefined) throw CustomError.badRequest("Missing price");
    if (!description) throw CustomError.badRequest("Missing description");
    if (!user) throw CustomError.badRequest("Missing user");
    if (!category) throw CustomError.badRequest("Missing category");

    return new ProductEntity(
      _id || id,
      name,
      available,
      price,
      description,
      user,
      category,
    );
  }
}
