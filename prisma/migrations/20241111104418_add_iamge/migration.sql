-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "stok" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
