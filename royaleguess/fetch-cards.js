import fs from 'fs';
import https from 'https';

const url = 'https://royaleapi.github.io/cr-api-data/json/cards.json';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const rawCards = JSON.parse(data);
      
      // Veriyi bizim formatımıza dönüştür
      // Not: RoyaleAPI verisinde bazı alanlar farklı olabilir, manuel mapping gerekebilir.
      // Ancak temel alanları (name, rarity, elixir, type) alıp eksikleri varsayılan yapacağız.
      
      const mappedCards = rawCards.map(card => {
        // Kart key'inden görsel ismini çıkar (örn: "knight" -> "knight.png")
        const imageKey = card.key; 
        
        return {
          id: card.id,
          name: card.name,
          rarity: card.rarity || "Common",
          elixir: card.elixir || 0,
          type: card.type || "Troop",
          arena: card.arena || 0,
          // Target ve Speed bilgisi her zaman JSON'da olmayabilir, 
          // bunları tahmin etmeye çalışacağız veya varsayılan atayacağız.
          // RoyaleAPI data yapısında 'description' var ama target/speed direkt yoksa manuel düzeltme gerekebilir.
          // Şimdilik basit mapping yapıyoruz.
          target: "Ground", // Varsayılan
          speed: "Medium",  // Varsayılan
          image: `${imageKey}.png`
        };
      });

      // JSON dosyasına yaz
      fs.writeFileSync('./src/data/cards-full.json', JSON.stringify(mappedCards, null, 2));
      console.log(`Successfully fetched ${mappedCards.length} cards.`);
      
    } catch (e) {
      console.error("Error parsing JSON:", e);
    }
  });

}).on('error', (err) => {
  console.error("Error fetching data:", err);
});
