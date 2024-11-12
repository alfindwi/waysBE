import { prisma } from "../libs/prisma";

export const getCart = async (userId: number) => {
  try {
    const cart = await prisma.cart.findMany({
      where: {
        userId: userId,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalAmount = cart.reduce((acc, item) => {
      const amount = item.totalAmount || 0;
      return acc + amount;
    }, 0);

    return { cart, totalAmount };
  } catch (error) {
    throw new Error(`Error getting cart: ${error}`);
  }
};

export const createCartItem = async (userId: number, productId: number) => {
  try {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          totalAmount: 0,
        },
        include: { cartItems: true },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const productStock = parseInt(product.stok || "0");
    const quantity = 1;

    if (productStock < quantity) {
      throw new Error("Not enough stock available");
    }

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      throw new Error("Product already in cart");
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stok: (productStock - quantity).toString() },
    });

    const productPrice = parseInt(product.price || "0");
    if (isNaN(productPrice)) {
      throw new Error("Invalid product price");
    }

    const totalPrice = productPrice * quantity;

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        productPrice: productPrice,
        totalPrice: totalPrice,
      },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalAmount: {
          increment: totalPrice,
        },
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { cartItems: true },
    });

    return updatedCart;
  } catch (error) {
    throw new Error(`Error creating cart item: ${error}`);
  }
};

export const updateCartItem = async (
  userId: number,
  cartItemId: number,
  newQuantity: number | undefined
) => {
  try {
    console.log(
      `Updating cart item: userId=${userId}, cartItemId=${cartItemId}, newQuantity=${newQuantity}`
    );

    // Pastikan newQuantity adalah angka dan valid
    if (newQuantity === undefined || isNaN(newQuantity)) {
      throw new Error("New quantity is required and must be a valid number");
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true, cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error("Cart item not found or unauthorized");
    }

    const product = cartItem.product;
    const currentQuantity = cartItem.quantity;
    const productStok = parseInt(product.stok || "0");

    if (isNaN(productStok)) {
      throw new Error("Invalid stock value for the product");
    }

    const quantityDiff = newQuantity - currentQuantity;
    if (quantityDiff > 0 && quantityDiff > productStok) {
      throw new Error("Not enough stock available");
    }

    const updatedStock = productStok - quantityDiff;
    await prisma.product.update({
      where: { id: product.id },
      data: { stok: updatedStock.toString() },
    });

    const productPrice = parseInt(cartItem.productPrice?.toString() || "0");

    // Log nilai untuk memastikan productPrice dan newQuantity
    console.log("Product Price:", productPrice);
    console.log("New Quantity:", newQuantity);

    const newTotalPrice = productPrice * newQuantity;

    if (isNaN(newTotalPrice)) {
      throw new Error("Invalid total price calculation after multiplication");
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQuantity, totalPrice: newTotalPrice },
    });

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    const totalAmount = cartItems.reduce(
      (acc, item) => acc + parseInt(item.totalPrice?.toString() || "0"),
      0
    );

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { totalAmount: totalAmount },
    });

    return await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });
  } catch (error) {
    console.error(`Error updating cart item: ${(error as Error).message}`);
    throw new Error(`Error updating cart item: ${(error as Error).message}`);
  }
};

export const deleteCartItem = async (cartItemId: number, userId: number) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
      },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const productStock = parseInt(cartItem.product.stok || "0");
    const newStock = productStock + cartItem.quantity;

    await prisma.product.update({
      where: { id: cartItem.product.id },
      data: { stok: newStock.toString() },
    });

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });
    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { totalAmount: totalAmount },
    });
  } catch (error) {
    throw new Error(`Error deleting cart: ${error}`);
  }
};
