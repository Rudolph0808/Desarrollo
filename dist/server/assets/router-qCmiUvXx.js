import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster as Toaster$1 } from "sonner";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/styles-BOxu5dKN.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-display font-bold", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "La ruta que buscas no existe." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
        children: "Ir al dashboard"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Could not load page" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center gap-2", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          router2.invalidate();
          reset();
        },
        className: "rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
        children: "Reintentar"
      }
    ) })
  ] }) });
}
const Route$8 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EnergyOps — Energy consumption dashboard" },
      { name: "description", content: "Dashboard mensual de consumo de agua, gas y electricidad por planta del complejo industrial." }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$8.useRouteContext();
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" })
  ] });
}
const $$splitComponentImporter$7 = () => import("./simulador-CkXC5fqY.js");
const Route$7 = createFileRoute("/simulador")({
  head: () => ({
    meta: [{
      title: "Simulator — EnergyOps"
    }, {
      name: "description",
      content: "Forecast consumption and cost from a production volume."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./plantas-D3NdXhda.js");
const Route$6 = createFileRoute("/plantas")({
  head: () => ({
    meta: [{
      title: "Plants — EnergyOps"
    }, {
      name: "description",
      content: "Consumption comparison across complex plants."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./modelos-CDIYowAN.js");
const Route$5 = createFileRoute("/modelos")({
  head: () => ({
    meta: [{
      title: "Model health — EnergyOps"
    }, {
      name: "description",
      content: "Forecast accuracy (MAPE) per plant and energy against the 5% target."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./historico-C1p5u87H.js");
const Route$4 = createFileRoute("/historico")({
  head: () => ({
    meta: [{
      title: "History — EnergyOps"
    }, {
      name: "description",
      content: "Time series of consumption by plant and energy."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./datos-CTVSwHy3.js");
const Route$3 = createFileRoute("/datos")({
  head: () => ({
    meta: [{
      title: "Data — EnergyOps"
    }, {
      name: "description",
      content: "Enter monthly consumption and generate forecasts."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./costos-DzWW3jgD.js");
const Route$2 = createFileRoute("/costos")({
  head: () => ({
    meta: [{
      title: "Costs — EnergyOps"
    }, {
      name: "description",
      content: "Unit rates and monthly cost for the complex."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-CjwyuRh3.js");
const Route$1 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Overview — EnergyOps"
    }, {
      name: "description",
      content: "Monthly overview of the complex energy consumption."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./planta._plantId-BztKmwMq.js");
const Route = createFileRoute("/planta/$plantId")({
  head: () => ({
    meta: [{
      title: "Plant detail — EnergyOps"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SimuladorRoute = Route$7.update({
  id: "/simulador",
  path: "/simulador",
  getParentRoute: () => Route$8
});
const PlantasRoute = Route$6.update({
  id: "/plantas",
  path: "/plantas",
  getParentRoute: () => Route$8
});
const ModelosRoute = Route$5.update({
  id: "/modelos",
  path: "/modelos",
  getParentRoute: () => Route$8
});
const HistoricoRoute = Route$4.update({
  id: "/historico",
  path: "/historico",
  getParentRoute: () => Route$8
});
const DatosRoute = Route$3.update({
  id: "/datos",
  path: "/datos",
  getParentRoute: () => Route$8
});
const CostosRoute = Route$2.update({
  id: "/costos",
  path: "/costos",
  getParentRoute: () => Route$8
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const PlantaPlantIdRoute = Route.update({
  id: "/planta/$plantId",
  path: "/planta/$plantId",
  getParentRoute: () => Route$8
});
const rootRouteChildren = {
  IndexRoute,
  CostosRoute,
  DatosRoute,
  HistoricoRoute,
  ModelosRoute,
  PlantasRoute,
  SimuladorRoute,
  PlantaPlantIdRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
