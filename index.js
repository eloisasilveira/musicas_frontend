const listaMusicas = document.getElementById('listaMusicas');

async function buscarMusicas() {
  const urlBackend = 'http://localhost:3000';

  listaMusicas.innerHTML = '';

  const resposta = await fetch(urlBackend);
  const musicas = await resposta.json();

  musicas.forEach((musica) => {
    listaMusicas.innerHTML += `
      <div class="card">
        <h3>${musica.titulo}</h3>
        <p><strong>Artista:</strong> ${musica.artista}</p>
        <p><strong>Gênero:</strong> ${musica.genero}</p>
        <p><strong>Ano:</strong> ${musica.ano}</p>
        <p><strong>Duração:</strong> ${musica.duracao}</p>
        <a href="editar.html?id=${musica.id}">Editar</a>
        <button onclick="apagarMusica(${musica.id})">Apagar</button>
      </div>
    `;
  });
}

async function apagarMusica(id) {
  console.log("ID recebido na função apagarMusica:", id);

  const urlBackend = 'http://localhost:3000';

  const confirmou = confirm("Tem certeza que quer apagar essa música?");

  if (!confirmou) {
    return;
  }

  const resposta = await fetch(`${urlBackend}/apagar/${id}`, {
    method: "DELETE"
  });

  const dados = await resposta.json();
  alert(dados.mensagem);

  window.location.reload();
}

window.apagarMusica = apagarMusica;

buscarMusicas();