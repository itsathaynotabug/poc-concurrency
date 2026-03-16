#!/usr/bin/env node
// run-lost-update-test.js

const { exec } = require("child_process");
const http = require("http");

async function resetDatabase() {
  return new Promise((resolve, reject) => {
    console.log("🔄 Resetando banco via POST /reset...");

    const postData = JSON.stringify({});
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/reset",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("✅ Banco resetado com sucesso!");
          resolve(true);
        } else {
          console.error("❌ Erro ao resetar banco:", res.statusCode);
          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Erro na conexão:", error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function runTest() {
  // Reset via API
  const resetOk = await resetDatabase();

  if (!resetOk) {
    console.error("❌ Falha no reset, abortando teste.");
    process.exit(1);
  }

  console.log("⏳ Aguardando 2 segundos para sincronização...");

  setTimeout(() => {
    console.log("🚀 Inicializando teste: lost-update-test.js");

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
  }, 2000);
}

runTest();

