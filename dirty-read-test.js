// dirty-read.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:3000";
const HEADERS = { "Content-Type": "application/json" };

export const options = {
  scenarios: {
    evolucao: {
      executor: "constant-vus",
      vus: 1,
      duration: "20s",
      exec: "evolucao",
    },
    consulta: {
      executor: "constant-vus",
      vus: 10,
      duration: "20s",
      exec: "consulta",
    },
  },
  thresholds: {
    http_req_failed: ["rate==0"],
  },
};

// Fica alternando o Charmander entre evoluções
export function evolucao() {
  const get = http.get(`${BASE_URL}/pokemons/4`);
  const pokemon = JSON.parse(get.body);

  const novoStatus = pokemon.status === "ativo" ? "evoluindo" : "ativo";
  const novoNome   = novoStatus === "evoluindo" ? "charmeleon" : "charmander";

  const payload = JSON.stringify({
    ...pokemon,
    nome: novoNome,
    status: novoStatus,
    atualizadoEm: new Date().toISOString(),
  });

  http.put(`${BASE_URL}/pokemons/4`, payload, { headers: HEADERS });
  console.log(`[EVOLUÇÃO] ${novoNome} | status: ${novoStatus}`);
  sleep(0.3);
}

// Leitores consultam e registram o que viram
export function consulta() {
  const res = http.get(`${BASE_URL}/pokemons/4`);
  const pokemon = JSON.parse(res.body);

  check(res, {
    "consulta ok": (r) => r.status === 200,
    "nome definido": (r) => JSON.parse(r.body).nome !== undefined,
  });

  console.log(
    `[TREINADOR VU-${__VU}] viu: ${pokemon.nome} | status: ${pokemon.status}`
  );
  sleep(0.5);
}