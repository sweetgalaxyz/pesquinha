
const lago = document.getElementById('lago');
const pontuacaoTexto = document.getElementById('pontuacao');
const somPloc = document.getElementById('somPloc');
const rankingLista = document.getElementById('ranking-list');
let pontuacao = 0;
let perdidos = 0;
let jogador = "";

const BIN_ID = "68803ae6f7e7a370d1ec4913";
const API_KEY = "$2a$10$O0L6jOOJ0w1dTq9.RoMaSOT330/R8rP4FE65VJq6OlPoor4oDs/Xy";

function iniciarJogo() {
  jogador = prompt("Digite seu nome:");
  if (!jogador) jogador = "Jogador Anônimo";
  pontuacao = 0;
  perdidos = 0;
  pontuacaoTexto.textContent = `Peixes pescados: ${pontuacao}`;
  setInterval(criarPeixe, 1500);
}

const imagensPeixes = [
  'imagens/peixe1.png',
  'imagens/peixe2.png',
  'imagens/peixe3.png'
];

function criarPeixe() {
  const peixe = document.createElement('img');
  peixe.src = imagensPeixes[Math.floor(Math.random() * imagensPeixes.length)];
  peixe.classList.add('peixe');

  const tamanho = Math.random() * 30 + 30;
  peixe.style.width = `${tamanho}px`;
  peixe.style.top = Math.random() * 370 + 'px';

  const duracao = Math.random() * 1.5 + 1.5; 
  peixe.style.animation = `nadar ${duracao}s linear forwards`;
  peixe.style.left = '-60px';

  let foiPescado = false;

  peixe.addEventListener('click', () => {
    somPloc.currentTime = 0;
    somPloc.play();
    peixe.remove();
    foiPescado = true;
    pontuacao++;
    pontuacaoTexto.textContent = `Peixes pescados: ${pontuacao}`;
    atualizarRanking();
  });

  lago.appendChild(peixe);

  const velocidade = (600 + tamanho) / duracao;
  let pos = -tamanho;
  const mover = setInterval(() => {
    pos += velocidade / 30;
    peixe.style.left = pos + 'px';
    if (pos > 650) {
      clearInterval(mover);
      if (!foiPescado) {
        peixe.remove();
        perdidos++;
        if (perdidos >= 2) {
          alert(`Fim de jogo, ${jogador}! Você deixou escapar 2 peixes.`);
          location.reload();
        }
      }
    }
  }, 33);
}

function atualizarRanking() {
  let ranking = JSON.parse(localStorage.getItem('ranking') || "[]");
  const index = ranking.findIndex(p => p.nome === jogador);
  if (index >= 0) {
    if (pontuacao > ranking[index].pontos) {
      ranking[index].pontos = pontuacao;
    }
  } else {
    ranking.push({ nome: jogador, pontos: pontuacao });
  }
  ranking.sort((a, b) => b.pontos - a.pontos);
  localStorage.setItem('ranking', JSON.stringify(ranking));
  mostrarRanking();
  salvarRankingOnline(ranking);
}

function mostrarRanking() {
  let ranking = JSON.parse(localStorage.getItem('ranking') || "[]");

  const nomesUnicos = new Set();
  ranking = ranking.filter(j => {
    if (nomesUnicos.has(j.nome)) return false;
    nomesUnicos.add(j.nome);
    return true;
  });

  rankingLista.innerHTML = "";
  ranking.forEach((jogador, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${jogador.nome} - ${jogador.pontos}`;
    rankingLista.appendChild(li);
  });
}

function salvarRankingOnline(ranking) {
  fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify({ ranking })
  }).catch(err => console.error("Erro ao salvar no JSONBin:", err));
}

function carregarRankingOnline() {
  fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": API_KEY
    }
  })
  .then(res => res.json())
  .then(data => {
    const ranking = data.record.ranking || [];
    localStorage.setItem('ranking', JSON.stringify(ranking));
    mostrarRanking();
  })
  .catch(err => console.error("Erro ao carregar ranking do JSONBin:", err));
}

window.onload = () => {
  carregarRankingOnline();
  iniciarJogo();
};

window.onload = () => {
  carregarRankingOnline();
  iniciarJogo();
};
