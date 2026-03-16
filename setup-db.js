// setup-db.js — rode com: node setup-db.js
const fs = require("fs");

async function setup() {
  const pokemons = [];

  for (let i = 1; i <= 10; i++) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    const data = await res.json();

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

    console.log(`Buscado: ${data.name}`);
  }

  // Adicionar Pikachu (ID 25) para testes de concorrência
  const pikachu = await fetch("https://pokeapi.co/api/v2/pokemon/25");
  const pikachuData = await pikachu.json();
  pokemons.push({
    id: pikachuData.id,
    nome: pikachuData.name,
    hp: pikachuData.stats[0].base_stat,
    ataque: pikachuData.stats[1].base_stat,
    defesa: pikachuData.stats[2].base_stat,
    status: "ativo",
    editadoPor: null,
    timestamp: new Date().toISOString(),
  });
  console.log(`Buscado: ${pikachuData.name}`);

  fs.writeFileSync("db.json", JSON.stringify({ pokemons }, null, 2));
  console.log("db.json criado com sucesso!");
}

setup();