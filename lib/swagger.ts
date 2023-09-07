import { createSwaggerSpec } from "next-swagger-doc"

import "server-only";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Vulnerable API Documentation",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            name: "Bearer Authentication",
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  })
  return spec
}
