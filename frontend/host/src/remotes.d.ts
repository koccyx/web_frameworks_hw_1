declare module "mfCatalog/App" {
  import type { ComponentType } from "react";
  import type { User } from "@mf/shared";
  const Component: ComponentType<{ user: User }>;
  export default Component;
}

declare module "mfMatching/App" {
  import type { ComponentType } from "react";
  import type { User } from "@mf/shared";
  const Component: ComponentType<{ user: User }>;
  export default Component;
}
