#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const glob = require('glob')
const {cp, cd, exec, mkdir } = require('shelljs')
const rimraf = require('rimraf')

const [executor, ignoredBin, ...args] = process.argv

const buildLocal = path.join(process.cwd(), "build")

const hasBuildLocal = fs.existsSync(buildLocal)
const imageName = args[0]

if(!hasBuildLocal) {
  console.error(`Build folder '${buildLocal}' not found.`)
  process.exit(1)
}

if(!imageName) {
  console.log(`easy-scripts docker <name>`)
  console.error(`Parameter name is required.`)
  console.log(`Ex:`)
  console.log(`easy-scripts docker test.name`)
  console.log(`Or`)
  console.log(`easy-scripts docker test.name:1.0.1`)
  process.exit(1)
}

const dockerPath = path.join(__dirname, "../docker/");
const outputPath = path.join(__dirname, "../out/");
const dockerFiles = glob.sync(path.join(__dirname, "../docker", "*"));
const dockerOutputPath = path.join(outputPath, 'docker')

rimraf.sync(dockerOutputPath)
mkdir(dockerOutputPath)

dockerFiles.forEach(file => {
  const fileName = file.split("/").reverse()[0];
  let content = fs.readFileSync(file, "utf-8");

  fs.writeFileSync(path.join(dockerOutputPath, fileName), content);
});

cp("-R", path.join(process.cwd(), "build"), dockerOutputPath);
cd(dockerOutputPath);
exec(`docker build . -t ${imageName}`);
