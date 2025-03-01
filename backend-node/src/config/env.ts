import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 5001,
  MAVEN_PATH: process.env.MAVEN_PATH || "/usr/local/bin/mvn",

  // ✅ Generic setup based on NODE_ENV
  JAVA_PROJECT_PATH:
    process.env.JAVA_PROJECT_PATH ||
    (process.env.NODE_ENV === "production"
      ? "/app/demo-java-app"
      : "../../demo-java-app"),

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
};
