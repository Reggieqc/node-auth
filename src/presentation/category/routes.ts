import { Router } from "express";
import { CategoryController } from "./controller";

export class CategoryRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CategoryController();

    // Definir las rutas
    router.post("/", controller.createCategory);
    router.get("/", controller.getCategories);

    return router;
  }
}
