#!/usr/bin/env node
// run-dirty-read-test.js

const { exec } = require("child_process");
const fs = require("fs");

async function runTest() {
  console.log("🔄 Resetando banco de dados...");
  
  // Roda setup-db.js
  const setup = exec("node setup-db.js");
  
  setup.on("close", () => {
    console.log("⏳ Aguardando 2 segundos...");
    
    // Aguarda 2 segundos
    setTimeout(() => {
      console.log("🚀 Inicializando teste: dirty-read-test.js");
      
      // Roda o teste
      const test = exec("k6 run dirty-read-test.js");
      
      test.stdout.on("data", (data) => {
        process.stdout.write(data);
      });
      
      test.stderr.on("data", (data) => {
        process.stderr.write(data);
      });
      
      test.on("close", (code) => {
        process.exit(code);
      });
    }, 2000);
  });
}

runTest();
