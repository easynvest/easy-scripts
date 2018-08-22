// console.log('easy-scripts kubernetes app_name app_version namespace')
// #! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const glob = require("glob");
const { cp, cd, exec, mkdir, which } = require("shelljs");
const rimraf = require("rimraf");

const [executor, ignoredBin, ...args] = process.argv;

const buildLocal = path.join(process.cwd(), "build");

const hasBuildLocal = fs.existsSync(buildLocal);
const appName = args[0];
const appVersion = args[1];
const appNameSpace = args[2];

if (!hasBuildLocal) {
  console.error(`Build folder '${buildLocal}' not found.`);
  process.exit(1);
}

if (!appName || !appVersion || !appNameSpace) {
  console.log(`easy-scripts kubernetes <name>`);
  console.error(`Parameter name is required.`);
  console.log(`Ex:`);
  console.log(`easy-scripts kubernetes test.name`);
  console.log(`Or`);
  console.log(`easy-scripts kubernetes test.name:1.0.1`);
  process.exit(1);
}

const kubernetesPath = path.join(__dirname, "../kubernetes/");
const outputPath = path.join(__dirname, "../out/");
const kubernetesFiles = glob.sync(path.join(__dirname, "../kubernetes", "*"));
const kubernetesOutputPath = path.join(outputPath, "kubernetes");
rimraf.sync(kubernetesOutputPath);
mkdir(kubernetesOutputPath);

kubernetesFiles.forEach(file => {
  const fileName = file.split("/").reverse()[0];
  let content = fs.readFileSync(file, "utf-8");

  fs.writeFileSync(path.join(kubernetesOutputPath, fileName), content);
});

const kubernetesOutputFiles = glob.sync(
  path.join(__dirname, "../out/kubernetes", "*")
);

kubernetesOutputFiles.forEach((file, i) => {
  fs.readFile(file, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    }
    let content;
    content = data.replace(/APP_NAME/g, appName);
    content = content.replace(/APP_VERSION/g, appVersion);
    content = content.replace(/NAMESPACE/g, appNameSpace);

    fs.writeFile(file, content, err => {
      if (err) console.log(err);
    });
  });
});

cp("-R", path.join(process.cwd(), "build"), kubernetesOutputPath);
cd(kubernetesOutputPath);
// exec(`docker build . -t ${imageName}`);
