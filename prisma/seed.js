const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.product.findFirst();

  if (existing) {
    console.log("Product already exists:", existing.name);
    return;
  }

  const product = await prisma.product.create({
    data: {
      name: "Carla Limited Edition Chair",
      description:
        "A premium ergonomic chair designed for maximum comfort and style in your workspace.",
      price: 249.99,
      imageUrl:
        "https://images.pexels.com/photos/6964072/pexels-photo-6964072.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
  });

  console.log("Seeded product:", product);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
