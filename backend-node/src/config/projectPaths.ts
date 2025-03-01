let JAVA_PROJECT_PATH =
  "/Users/gabrielodame/DevOps/maven-demo-project/demo-java-app"; // Default path

export const getJavaProjectPath = () => JAVA_PROJECT_PATH;
export const setJavaProjectPath = (newPath: string) => {
  JAVA_PROJECT_PATH = newPath;
  console.log(`✅ Java project path updated to: ${JAVA_PROJECT_PATH}`);
};
