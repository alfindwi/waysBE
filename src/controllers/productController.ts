import { Request, Response } from "express";
import * as productService from "../services/productService";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    if (user.role !== "ADMIN") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    const product = await productService.createProduct(req.body, req.file);

    res.status(200).json({ product, message: "Product created successfully" });
  } catch (error) {
    console.log("error", error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getProducts();

    res.status(200).json({ products });
    
  } catch (error) {
    console.log("error", error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

