const { promises: fsPromises } = require('fs');
const https = require('https');

// Função para ler o conteúdo do arquivo de forma assíncrona
async function readFileAsync(filePath) {
  try {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao ler o arquivo:', error.message);
    return [];
  }
}

// Função para obter informações de commits de um repositório
async function getCommitInfo(owner, repo) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
    
    const options = {
      headers: {
        'User-Agent': 'HarukaYamamoto0-GitHub-Script', // Adicione um User-Agent
      },
    };

    https.get(url, options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const commits = JSON.parse(data).length;
        resolve(commits);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Função principal
async function main() {
  try {
    // Carrega a lista de repositórios do arquivo repos.json
    const repos = await readFileAsync('./repos.json');

    // Mapeia os repositórios para obter informações de commits
    const reposWithCommits = await Promise.all(repos.map(async (repo) => {
      const [owner, name] = repo.split('/');
      const commits = await getCommitInfo(owner, name);
      return { repo, commits };
    }));

    // Ordena os repositórios com base no número de commits
    const sortedRepos = reposWithCommits.sort((a, b) => b.commits - a.commits);

    // Salva as informações ordenadas em respos-sabe.json
    await fsPromises.writeFile('./respos-sabe.json', JSON.stringify(sortedRepos, null, 2));

    console.log('Script concluído!');
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Executa a função principal
main();
