#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { cd, exec, mkdir } = require("shelljs");
const rimraf = require("rimraf");

const [executor, ignoredBin, ...args] = process.argv;

const appName = args[0];
const appVersion = args[1];
const appNameSpace = args[2];

if (!appName || !appVersion || !appNameSpace) {
  console.log(`easy-scripts kubernetes <name> <version> <namespace>`);
  console.error(`Parameters name, version and namespace are required.`);
  console.log(`Ex:`);
  console.log(`easy-scripts kubernetes testName 1.0.0 testNameSpace`);
  process.exit(1);
}

const kubernetesPath = path.join(__dirname, "../kubernetes/");
const outputPath = path.join(__dirname, "../out/");
const kubernetesFiles = glob.sync(path.join(kubernetesPath, "*"));
const kubernetesOutputPath = path.join(outputPath, "kubernetes");
rimraf.sync(kubernetesOutputPath);
mkdir(kubernetesOutputPath);

const replaceVariables = content => {
  return content
    .replace(/{APP_NAME}/g, appName)
    .replace(/{APP_VERSION}/g, appVersion)
    .replace(/{NAMESPACE}/g, appNameSpace);
};

kubernetesFiles.forEach(file => {
  const fileName = file.split("/").reverse()[0];
  const content = fs.readFileSync(file, "utf-8");

  fs.writeFileSync(
    path.join(kubernetesOutputPath, fileName),
    replaceVariables(content)
  );
});

exec(`kubectl apply -f ${path.join(kubernetesOutputPath, "deployment.yaml")}`);
