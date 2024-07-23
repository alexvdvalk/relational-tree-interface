import { defineInterface } from "@directus/extensions-sdk";
import InterfaceComponent from "./interface.vue";

export default defineInterface({
  id: "custom",
  name: "Relational Tree",
  icon: "box",
  description: "Tree Interface with a related collection",
  component: InterfaceComponent,
  options: [
    {
      name: "alex",
    },
  ],
  types: ["alias"],
  localTypes: ["m2m"],
});
