// double-action.js
import http from "k6/http";
import { check } from "k6";

const BASE_URL = "http://localhost:3000";
const HEADERS = { "Content-Type": "application/json" };

export const options = {
  scenarios: {
    captura_simultanea: {
      executor: "shared-iterations",
      vus: 20,
      iterations: 20,
      maxDuration: "5s",
    },
  },
  thresholds: {
    // Se qualquer requisição falhar → teste quebra
    http_req_failed: ["rate==0"],
  },
};

export default function () {
  // Todos tentam capturar o mesmo Mewtwo ao mesmo tempo
  const payload = JSON.stringify({
    nome: "mewtwo",
    hp: 106,
    ataque: 110,
    defesa: 90,
    status: "capturado",
    capturadoPor: `Treinador-${__VU}`,
    timestamp: new Date().toISOString(),
  });

  const res = http.post(`${BASE_URL}/pokemons`, payload, {
    headers: HEADERS,
  });

  check(res, {
    "captura retornou 201": (r) => r.status === 201,
    "tem id gerado":        (r) => JSON.parse(r.body).id !== undefined,
  });

  console.log(
    `[Treinador-${__VU}] capturou Mewtwo | id=${JSON.parse(res.body).id}`
  );
}