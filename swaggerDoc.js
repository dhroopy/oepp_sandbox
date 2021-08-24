const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  info: {
    title: "template_api",
    version: "1.0.0",
    description: "",
  },
  basePath: "/",
  servers: [
    {
      url: `http://localhost:5000`,
    },
  ],
};
const option = {
  swaggerDefinition,
  apis: ["./index.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsDoc(option);

module.exports = (app) => {
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};
