import midtrans from "../libs/midtrans";
import { prisma } from "../libs/prisma";
import axios from "axios";

const MIDTRANS_SERVER_KEY = process.env.MT_SERVER_KEY;

export const getOrder = async (userId: number) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        OrderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return orders;
  } catch (error) {
    throw new Error(`Error retrieving orders: ${(error as Error).message}`);
  }
};

export const createOrder = async (cartId: number) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { cartItems: true },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const totalAmount = cart.cartItems.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );

    const orderId = `ORDER-${cart.id}-${new Date().getTime()}`;

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: cart.userId,
        totalAmount,
        OrderItems: {
          create: cart.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            productPrice: item.productPrice,
            totalPrice: item.productPrice * item.quantity,
          })),
        },
      },
    });

    const parameters = {
      transaction_details: {
        order_id: orderId,  // Use the same orderId here for the transaction
        gross_amount: totalAmount,
      },
      item_details: cart.cartItems.map((item) => ({
        id: item.productId.toString(),
        price: item.productPrice,
        quantity: item.quantity,
        name: `ProductDumbMerch-${item.productId}`,
      })),
    };

    const transaction = await midtrans.createTransaction(parameters);

    await clearCart(cart.userId);

    return {
      cart,
      transaction,
      order,
    };
  } catch (error) {
    throw new Error(`Error creating order item: ${(error as Error).message}`);
  }
};



export const handlePaymentStatus = async (orderId: string, transaction_status: string) => {
  try {
    let status: "SUCCESS" | "CANCEL" = "CANCEL";

    if(transaction_status === "settlement") {
      status = "SUCCESS";
    }

    const updateOrder = await prisma.order.update({
      where: {id: orderId},
      data: {status}
    })

    return updateOrder
  } catch (error) {
    
  }
}

export const clearCart = async (userId: number) => {
  try {
    await prisma.cart.deleteMany({
      where: {
        userId,
      },
    });
  } catch (error) {
    throw new Error(`Error clearing cart: ${(error as Error).message}`);
  }
};
