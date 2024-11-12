import { Router } from "express";
import * as productController from "../controllers/productController";
import { authentication } from "../middlewares/authentication";
import upload from "../middlewares/uploadFile";
const productRouter = Router();

productRouter.get("/products",productController.getProducts);
productRouter.post("/products",authentication,upload.single("image"),productController.createProduct);

export default productRouter;
