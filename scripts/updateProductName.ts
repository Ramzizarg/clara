import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateProductName() {
  try {
    // Get the first product
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log("No product found in the database.");
      return;
    }

    // Update the product name
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { name: "V34 Colour Corrector Serum" },
    });

    console.log("Product name updated successfully:", updatedProduct);
  } catch (error) {
    console.error("Error updating product name:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductName();
