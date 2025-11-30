import https from 'https';

const i18nUrl = 'https://royaleapi.github.io/cr-api-data/json/cards_i18n.json';

https.get(i18nUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    if (data.length > 1000) { // İlk 1000 karakter yeterli
      console.log(data.substring(0, 1000));
      process.exit(0);
    }
  });
});
