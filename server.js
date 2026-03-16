// server.js - Custom json-server com endpoint /reset
const jsonServer = require("json-server");
const fs = require("fs");
const path = require("path");

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Usar middlewares padrão
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Endpoint customizado para resetar dados ANTES do router
server.post("/reset", async (req, res) => {
  try {
    console.log("🔄 Executando reset de dados...");

    // Busca dados da PokéAPI
    const pokemons = [];
    const pokemonIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25];

    for (const id of pokemonIds) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        pokemons.push({
          id: data.id,
          nome: data.name,
          hp: data.stats[0].base_stat,
          ataque: data.stats[1].base_stat,
          defesa: data.stats[2].base_stat,
          status: "ativo",
          editadoPor: null,
          timestamp: new Date().toISOString(),
        });

        console.log(`  ✅ ${data.name} carregado`);
      } catch (error) {
        console.error(`  ❌ Erro ao buscar pokémon ${id}:`, error.message);
      }
    }

    // Reescreve o db.json
    const dbPath = path.join(__dirname, "db.json");
    fs.writeFileSync(dbPath, JSON.stringify({ pokemons }, null, 2));

    console.log("✅ Reset concluído com sucesso!");
    res.status(200).json({
      success: true,
      message: "Database resetado com sucesso",
      pokemonsCount: pokemons.length,
    });
  } catch (error) {
    console.error("❌ Erro durante reset:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Agora usar o router para o restante das rotas
const router = jsonServer.router("db.json");
server.use(router);

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 JSON Server rodando na porta ${PORT}`);
  console.log(`📝 DB: db.json`);
  console.log(`🔄 POST /reset - para resetar dados\n`);
});
