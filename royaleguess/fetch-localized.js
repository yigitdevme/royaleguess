import fs from 'fs';
import https from 'https';

const cardsUrl = 'https://royaleapi.github.io/cr-api-data/json/cards.json';
const i18nUrl = 'https://royaleapi.github.io/cr-api-data/json/cards_i18n.json';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

async function main() {
  try {
    console.log('Fetching data...');
    const [rawCards, i18nData] = await Promise.all([
      fetchJson(cardsUrl),
      fetchJson(i18nUrl)
    ]);

    console.log('Processing translations...');
    
    const mergedCards = rawCards.map(card => {
      const translation = i18nData.find(t => t.id === card.id);
      
      // Doğru yol: translation._lang.name.tr
      const nameTr = translation?._lang?.name?.tr;

      // Target ve Speed için akıllı varsayılanlar
      let target = card.target || "Ground";
      let speed = card.speed || "Medium";

      // Tipine göre düzeltmeler
      if (card.type === 'Building') {
        speed = 'None';
        // Target verisi yoksa None yapalım, varsa kalsın
        if (!card.target) target = 'None';
      } else if (card.type === 'Spell') {
        speed = 'None';
        if (!card.target) target = 'None';
      }

      return {
        id: card.id,
        name: {
          en: card.name,
          tr: nameTr || card.name // Bulamazsa İngilizce
        },
        rarity: card.rarity || "Common",
        elixir: card.elixir || 0,
        type: card.type || "Troop",
        arena: card.arena || 0,
        target: target,
        speed: speed,
        image: `${card.key}.png`
      };
    });

    fs.writeFileSync('./src/data/cards-localized.json', JSON.stringify(mergedCards, null, 2));
    console.log(`Success! Processed ${mergedCards.length} cards with Turkish names.`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
