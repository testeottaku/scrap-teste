const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URLS = [
  'https://animefire.plus',
  'https://animefire.io'
];

async function fetchFromBase(baseUrl, slug) {
  const targetUrl = `${baseUrl}/animes/${slug}`;
  const { data } = await axios.get(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': `${baseUrl}/`
    },
    timeout: 20000,
    maxRedirects: 5
  });

  const $ = cheerio.load(data);
  const animeData = {
    titulo: $('.div_anime_names h1').first().text().trim(),
    capa: $('.sub_animepage_img img').first().attr('data-src') || $('.sub_animepage_img img').first().attr('src') || '',
    sinopse: $('.divSinopse .spanAnimeInfo').first().text().trim(),
    generos: [],
    episodios: []
  };

  $('.mr-1.spanGenerosLink').each((i, el) => {
    const genero = $(el).text().trim();
    if (genero && genero.toLowerCase() !== 'voltar' && !animeData.generos.includes(genero)) {
      animeData.generos.push(genero);
    }
  });

  $('.video_list_arrow a.Ep').each((i, el) => {
    const nome = $(el).text().trim();
    const href = $(el).attr('href');
    animeData.episodios.push({
      nome,
      link: href ? new URL(href, baseUrl).toString() : ''
    });
  });

  if (!animeData.titulo && !animeData.sinopse && animeData.episodios.length === 0) {
    const error = new Error('Estrutura não identificada');
    error.code = 'PARSE_EMPTY';
    throw error;
  }

  return animeData;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const rawSlug = String(req.query.url || 'naruto-todos-os-episodios').trim();
  const slug = rawSlug.replace(/^\/+|\/+$/g, '');

  for (const baseUrl of BASE_URLS) {
    try {
      const animeData = await fetchFromBase(baseUrl, slug);
      return res.status(200).json({
        ...animeData,
        fonte: baseUrl
      });
    } catch (error) {
      continue;
    }
  }

  return res.status(500).json({
    erro: 'Falha ao acessar ou extrair dados do site alvo.'
  });
};
