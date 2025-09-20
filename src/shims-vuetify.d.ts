// src/shims-vuetify.d.ts
declare module 'vuetify/styles';
declare module 'vuetify/components';
declare module 'vuetify/directives';
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}