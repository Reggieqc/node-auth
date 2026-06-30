import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { CreateProductDto } from "../../domain/dtos/products/create-product.dto";
import { PaginationDto } from "../../domain/dtos/shared/pagination.dto";
import { ProductService } from "../services/product.service";

export class ProductController {
  //DI
  constructor(private readonly productService: ProductService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res
      .status(500)
      .json({ error: "Internal server error - check logs" });
  };

  createProduct = (req: Request, res: Response) => {
    const [error, createProductDto] = CreateProductDto.create({
      ...req.body,
      user: req.body.user.id, //Para tener el usuario en el body tiene que tener el middleware de autenticacion
    });
    if (error) return res.status(400).json({ error });

    this.productService
      .createProduct(createProductDto!)
      .then((product) => res.status(201).json(product))
      .catch((error) => this.handleError(error, res));
  };

  getProducts = (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) return res.status(400).json({ error });

    this.productService
      .getProducts(paginationDto!)
      .then((products) => res.status(201).json(products))
      .catch((error) => this.handleError(error, res));
  };
}
