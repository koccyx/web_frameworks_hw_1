import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`users-service running on port ${env.PORT}`);
});

