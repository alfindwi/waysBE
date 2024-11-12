import { Request, Response } from "express";
import * as cartService from "../services/cartService";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const cart = await cartService.getCart(userId);

    res.status(200).json({ cart });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createCartItem = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const { productId } = req.body;

    const cartItem = await cartService.createCartItem(userId, productId);

    res.status(200).json({ cartItem });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const { newQuantity } = req.body;
    const cartItemId = parseInt(req.params.id);

    const updatedCartItem = await cartService.updateCartItem(
      userId,
      cartItemId,
      newQuantity
    );

    res.status(200).json({ updatedCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteCartItem = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const cartItemId = parseInt(req.params.id);

    await cartService.deleteCartItem(cartItemId, userId);

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};
