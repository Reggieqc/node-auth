import { ProductModel } from "../../data";
import {
  CreateProductDto,
  CustomError,
  PaginationDto,
  ProductEntity,
  UserEntity,
} from "../../domain";

export class ProductService {
  constructor() {}
  async createProduct(createProductDto: CreateProductDto) {
    const productExists = await ProductModel.findOne({
      name: createProductDto.name,
    });
    console.log(createProductDto);
    if (productExists) {
      throw CustomError.badRequest("Product already exists");
    }
    try {
      const product = new ProductModel({
        ...createProductDto,
      });

      await product.save();

      const productEntity = await ProductEntity.fromObject(product);

      return {
        ...productEntity,
      };
    } catch (error) {
      //Prestar atencion a estos errores;
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getProducts(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    try {
      const [total, products] = await Promise.all([
        ProductModel.countDocuments(),
        ProductModel.find()
          .skip((page - 1) * limit)
          .limit(limit),
        //Todo: popultate
      ]);
      return {
        page,
        limit,
        total,
        next: `/api/products?page=${page + 1}&limit=${limit}`,
        previous:
          page - 1 > 0 ? `/api/products?page=${page - 1}&limit=${limit}` : null,
        products: products,
      };
    } catch (error) {
      throw CustomError.internalServer("Internal server error");
    }
  }
}
