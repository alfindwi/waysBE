import { Router } from "express";
import * as cartController from "../controllers/cartController";
import { authentication } from "../middlewares/authentication";
const cartRouter = Router();

cartRouter.get("/", authentication, cartController.getCart);
cartRouter.post("/", authentication ,cartController.createCartItem);

cartRouter.put("/:id", authentication, cartController.updateCartItem);

cartRouter.delete("/:id", authentication,cartController.deleteCartItem);

export default cartRouter;
