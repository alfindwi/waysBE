import { Request, Response } from "express";
import * as orderService from "../services/orderService";
import axios from "axios";
import { prisma } from "../libs/prisma";
import { OrderStatus } from "@prisma/client";

export const getOrder = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const order = await orderService.getOrder(userId);

    res.status(200).json({ order });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.body;

    if (!cartId) {
      res.status(400).json({ error: "cartId is required" });
    }

    const { transaction } = await orderService.createOrder(cartId);

    res.status(200).json({ transaction });
  } catch (error) {
    console.log(error);

    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const paymentStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    const response = await axios.get(
      `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            "SB-Mid-server-NsggXUakgJS9BCRRyMBxamM9"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { order_id, transaction_status } = response.data;

    const statusMapping: Record<string, OrderStatus> = {
      settlement: OrderStatus.SUCCESS,
      pending: OrderStatus.PENDING,
      cancel: OrderStatus.CANCEL,
      expire: OrderStatus.CANCEL,
      deny: OrderStatus.CANCEL,
    };

    const mappedStatus =
      statusMapping[transaction_status] || OrderStatus.PENDING;

    const updateOrder = await prisma.order.update({
      where: { id: order_id },
      data: { status: mappedStatus },
    });

    res
      .status(200)
      .json({ message: "Order status updated successfully", updateOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handlePayment = async (req: Request, res: Response) => {
  const { orderId, transaction_status } = req.body;

  if (!orderId || !transaction_status) {
    res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const updateOrder = await orderService.handlePaymentStatus(
      orderId,
      transaction_status
    );

    res.status(200).json({ updateOrder });
  } catch (error) {}
};
