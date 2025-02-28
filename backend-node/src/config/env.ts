import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 5001,
  MAVEN_PATH: process.env.MAVEN_PATH || "/usr/local/bin/mvn",

  JAVA_PROJECT_PATH: process.env.FLY_APP_NAME
    ? "/app/demo-java-app"
    : "../../demo-java-app",

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
};
