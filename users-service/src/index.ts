import { app } from "./app";
import { env } from "./config/env";
import { ensureSingleAdmin } from "./modules/auth/admin";

const bootstrap = async () => {
  await ensureSingleAdmin();

  app.listen(env.PORT, () => {
    console.log(`users-service running on port ${env.PORT}`);
  });
};

void bootstrap();
