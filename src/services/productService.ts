import { CreateProductDto } from "../dto/productDto";
import uploader from "../libs/cloudinary";
import { prisma } from "../libs/prisma";

export const createProduct = async (
  body: CreateProductDto,
  file?: Express.Multer.File
) => {
  try {
    const createData: Required<CreateProductDto> = {
      name: body.name ?? "",
      price: body.price ?? "",
      stok: body.stok ?? "",
      description: body.description ?? "",
      image: "", 
    };

    if (file) {
      const imageProduct = await uploader(file);
      createData.image = imageProduct.secure_url;
    }

    const product = await prisma.product.create({
      data: {
        ...createData,
      },
    });

    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Error creating product: ${(error as Error).message}`);
  }
};

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany();
    return products;
  } catch (error) {
    throw new Error(`Error getting products: ${error}`);
  }
};


