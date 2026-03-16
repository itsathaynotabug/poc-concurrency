#!/usr/bin/env node
// run-lost-update-test.js

const { exec } = require("child_process");
const fs = require("fs");

async function runTest() {
  console.log("🔄 Resetando banco de dados...");
  
  // Roda setup-db.js
  const setup = exec("node setup-db.js");
  
  setup.on("close", () => {
    console.log("⏳ Aguardando 3 segundos para json-server recarregar...");
    
    // Aguarda 3 segundos
    setTimeout(() => {
      console.log("🚀 Inicializando teste: lost-update-test.js");
      
      // Roda o teste
      const test = exec("k6 run lost-update-test.js");
      
      test.stdout.on("data", (data) => {
        process.stdout.write(data);
      });
      
      test.stderr.on("data", (data) => {
        process.stderr.write(data);
      });
      
      test.on("close", (code) => {
        process.exit(code);
      });
    }, 3000);
  });
}

runTest();
