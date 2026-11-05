
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
      </div>
    `;
  });
}


buscarMusicas();