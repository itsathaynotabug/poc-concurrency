#!/usr/bin/env node
// run-double-action-test.js

const { exec } = require("child_process");
const http = require("http");

async function checkServerHealth(attempts = 10) {
  for (let i = 0; i < attempts; i++) {
    return new Promise((resolve) => {
      const req = http.get("http://localhost:3000/pokemons", (res) => {
        console.log(`✅ Servidor respondendo com status ${res.statusCode}`);
        resolve(true);
        req.destroy();
      });

      req.on("error", () => {
        if (i < attempts - 1) {
          console.log(`⚠️ Tentativa ${i + 1}/${attempts} - servidor não respondendo, aguardando...`);
          setTimeout(() => {
            resolve(checkServerHealth(attempts - i - 1));
          }, 1000);
        } else {
          console.error(`❌ Servidor não respondeu após ${attempts} tentativas!`);
          resolve(false);
        }
        req.destroy();
      });

      req.setTimeout(2000);
    });
  }
}

async function runTest() {
  console.log("🔄 Resetando banco de dados...");
  
  // Roda setup-db.js
  const setup = exec("node setup-db.js");
  
  setup.on("close", async () => {
    console.log("⏳ Aguardando 3 segundos para json-server recarregar...");
    
    setTimeout(async () => {
      // Verifica se servidor está saudável
      console.log("🏥 Verificando saúde do servidor json-server...");
      const isHealthy = await checkServerHealth(10);
      
      if (!isHealthy) {
        console.error("❌ Servidor não está saudável! Abortando teste.");
        process.exit(1);
      }
      
      console.log("🚀 Inicializando teste: double-action-test.js");
      
      // Roda o teste
      const test = exec("k6 run double-action-test.js");
      
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
