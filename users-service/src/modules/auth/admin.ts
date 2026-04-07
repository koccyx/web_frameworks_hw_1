import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

const ADMIN_EMAIL = "admin";
const ADMIN_PASSWORD = "admin";
const ADMIN_ROLE = "admin";

export const ensureSingleAdmin = async () => {
  await prisma.user.updateMany({
    where: {
      role: ADMIN_ROLE,
      NOT: {
        email: ADMIN_EMAIL
      }
    },
    data: {
      role: "user"
    }
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: {
      email: ADMIN_EMAIL
    },
    update: {
      passwordHash,
      role: ADMIN_ROLE
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: ADMIN_ROLE
    }
  });
};
