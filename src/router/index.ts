import { Router } from "express";
import authRouter from "./auth";
import productRouter from "./product";
import cartRouter from "./cart";
import orderRouter from "./order";

const router = Router()

router.use('/auth', authRouter)
router.use('/cart', cartRouter)
router.use("/order", orderRouter)
router.use('/admin', productRouter)

export default router
