// lost-update.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:3000";
const HEADERS = { "Content-Type": "application/json" };

export const options = {
  scenarios: {
    rafa: {
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
      env: { TREINADOR: "Rafa", ATAQUE: "999" },
    },
    messora: {
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
      env: { TREINADOR: "Messora", ATAQUE: "1" },
    },
    thay: {
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
      env: { TREINADOR: "Thay", ATAQUE: "1" },
    },
    tata: {
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
      env: { TREINADOR: "Tata", ATAQUE: "1" },
    },
    juan: {
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
      env: { TREINADOR: "Juan", ATAQUE: "1" },
    },
  },
};

export default function () {
  const treinador = __ENV.TREINADOR;
  const ataque = __ENV.ATAQUE;

  // 1. Lê o Pikachu atual
  const get = http.get(`${BASE_URL}/pokemons/25`);
  const pokemon = JSON.parse(get.body);
  check(get, { "leitura ok": (r) => r.status === 200 });

  // Simula tempo de edição
  sleep(Math.random() * 0.5);

  // 2. Salva com seu próprio valor
  const payload = JSON.stringify({
    ...pokemon,
    ataque: parseInt(ataque),
    editadoPor: treinador,
    timestamp: new Date().toISOString(),
  });

  const put = http.put(`${BASE_URL}/pokemons/1`, payload, {
    headers: HEADERS,
  });

  check(put, { "update ok": (r) => r.status === 200 });

  console.log(`[${treinador}] salvou ataque=${ataque} | status=${put.status}`);
  sleep(1);
}