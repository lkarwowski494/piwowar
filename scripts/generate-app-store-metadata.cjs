const fs = require('fs');
const path = require('path');

const locales = [
  { code: 'pl', name: 'Polish', title: 'Piwowar — Asystent Warzenia', subtitle: 'Dziennik warek & kalkulator', keywords: 'piwo,warzenie,piwowar,receptury,kalkulator,piwowarstwo,beerxml,bjcp,tilt,fermentacja' },
  { code: 'en', name: 'English', title: 'Brewcraft — Brewing Assistant', subtitle: 'Brew day timer & batch ledger', keywords: 'brewing,homebrew,beer,beerxml,bjcp,hydrometer,tilt,brewday,fermentation,refractometer' },
  { code: 'de', name: 'German', title: 'Brewcraft — Brauassistent', subtitle: 'Sudbuch & Brautag Timer', keywords: 'bier,brauen,heimbrauer,sudhaus,maischen,rezept,bierxml,bjcp,gärung,rechner' },
  { code: 'cs', name: 'Czech', title: 'Piwowar — Varný Asistent', subtitle: 'Deník várek a kalkulačky', keywords: 'pivo,domovarnik,vareni,rmutovani,chmelovar,kvaseni,recepty,bierxml,bjcp,tilt' },
  { code: 'sk', name: 'Slovak', title: 'Piwowar — Asistent Varenia', subtitle: 'Denník várok a kalkulačky', keywords: 'pivo,varenie,domovarnik,kvasenie,recepty,beerxml,bjcp,tilt,chmel,slad' },
  { code: 'fr', name: 'French', title: 'Brewcraft — Brassage Amateur', subtitle: 'Journal de brassin et minuteur', keywords: 'biere,brassage,brasseur,houblon,malt,recette,fermentation,densite,beerxml,bjcp' },
  { code: 'es', name: 'Spanish', title: 'Brewcraft — Cerveza Casera', subtitle: 'Diario de lotes y calculadora', keywords: 'cerveza,elaboracion,lotes,recetas,lupulo,malta,fermentacion,densimetro,beerxml,bjcp' },
  { code: 'es-419', name: 'Spanish Latin America', title: 'Brewcraft — Cerveza Artesanal', subtitle: 'Calculadora y lotes de cerveza', keywords: 'cerveza,artesanal,lotes,recetas,lupulo,malta,fermentacion,densidad,beerxml,bjcp' },
  { code: 'it', name: 'Italian', title: 'Brewcraft — Birra Fatta in Casa', subtitle: 'Diario cotte e calcolatori', keywords: 'birra,homebrewing,cotta,luppolo,malto,fermentazione,densimetro,ricette,beerxml,bjcp' },
  { code: 'nl', name: 'Dutch', title: 'Brewcraft — Brouw Assistent', subtitle: 'Brouwlogboek en rekenhulp', keywords: 'bier,brouwen,hobbybrouwer,hop,mout,vergisting,recepten,densiteit,beerxml,bjcp' },
  { code: 'pt', name: 'Portuguese', title: 'Brewcraft — Produção de Cerveja', subtitle: 'Diário de lotes e timer', keywords: 'cerveja,artesanal,brassagem,lupulo,malte,fermentacao,densimetro,beerxml,bjcp' },
  { code: 'pt-BR', name: 'Portuguese Brazil', title: 'Brewcraft — Cerveja Artesanal', subtitle: 'Controle de lotes e brassagem', keywords: 'cerveja,artesanal,caseira,brassagem,lupulo,malte,fermentacao,densidade,beerxml,bjcp' },
  { code: 'sv', name: 'Swedish', title: 'Brewcraft — Bryggarassistent', subtitle: 'Brygglogg och kalkylatorer', keywords: 'öl,bryggning,hembryggning,humle,malt,jäst,jäsning,recept,beerxml,bjcp' },
  { code: 'da', name: 'Danish', title: 'Brewcraft — Brygassistent', subtitle: 'Bryglog og lommeregner', keywords: 'øl,håndbryg,brygning,humle,malt,gæring,opskrifter,beerxml,bjcp,tilt' },
  { code: 'nb', name: 'Norwegian', title: 'Brewcraft — Bryggeassistent', subtitle: 'Bryggelogge og kalkulator', keywords: 'øl,heimebrygging,brygging,humle,malt,gjæring,oppskrifter,beerxml,bjcp' },
  { code: 'fi', name: 'Finnish', title: 'Brewcraft — Oluenvalmistus', subtitle: 'Päiväkirja ja laskimet', keywords: 'olut,kotiolut,paneminen,humala,mallas,käyminen,reseptit,beerxml,bjcp' },
  { code: 'uk', name: 'Ukrainian', title: 'Piwowar — Крафтове Варіння', subtitle: 'Журнал варок і таймер', keywords: 'пиво,варіння,крафт,бродіння,хміль,солод,рецепти,beerxml,bjcp,густина' },
  { code: 'ru', name: 'Russian', title: 'Brewcraft — Домашнее Пиво', subtitle: 'Журнал варок и калькулятор', keywords: 'пиво,пивоварение,варка,хмель,солод,брожение,рецепты,beerxml,bjcp,плотность' },
  { code: 'hu', name: 'Hungarian', title: 'Brewcraft — Sörfőző Aszisztens', subtitle: 'Főzési napló és kalkulátor', keywords: 'sör,sörfőzés,házi,komló,maláta,erjedés,receptek,beerxml,bjcp' },
  { code: 'ro', name: 'Romanian', title: 'Brewcraft — Preparare Bere', subtitle: 'Jurnal de loturi și calculator', keywords: 'bere,artizanala,fierbere,hamei,malt,fermentare,retete,beerxml,bjcp' },
  { code: 'bg', name: 'Bulgarian', title: 'Brewcraft — Домашно Пивоварство', subtitle: 'Дневник на варките и таймер', keywords: 'бира,пивоварство,хмел,малц,ферментация,рецепти,beerxml,bjcp' },
  { code: 'hr', name: 'Croatian', title: 'Brewcraft — Kuhanje Piva', subtitle: 'Dnevnik kuhanja i kalkulatori', keywords: 'pivo,kuhanje,domace,hmelj,slad,vrenje,recepti,beerxml,bjcp' },
  { code: 'sl', name: 'Slovenian', title: 'Brewcraft — Varjenje Piva', subtitle: 'Dnevnik varjenja in kalkulator', keywords: 'pivo,varjenje,domace,hmelj,slad,vrenje,recepti,beerxml,bjcp' },
  { code: 'sr', name: 'Serbian', title: 'Brewcraft — Кување Пива', subtitle: 'Дневник кувања и тајмер', keywords: 'пиво,кување,домаће,хмељ,слад,врење,рецепти,beerxml,bjcp' },
  { code: 'lt', name: 'Lithuanian', title: 'Brewcraft — Alaus Virimas', subtitle: 'Virimo žurnalas ir skaičiuoklė', keywords: 'alus,virimas,namuose,apyniai,salyklas,fermentacija,receptai,beerxml' },
  { code: 'lv', name: 'Latvian', title: 'Brewcraft — Alus Brūvēšana', subtitle: 'Brūvēšanas žurnāls un taimeris', keywords: 'alus,brūvēšana,mājās,apiņi,iesals,rūgšana,receptes,beerxml' },
  { code: 'et', name: 'Estonian', title: 'Brewcraft — Õllepruulimine', subtitle: 'Pruulipäevik ja kalkulaator', keywords: 'õlu,pruulimine,kodus,humal,linased,käärimine,retseptid,beerxml' },
  { code: 'tr', name: 'Turkish', title: 'Brewcraft — Evde Bira Yapımı', subtitle: 'Parti günlüğü ve sayaç', keywords: 'bira,evde,yapim,serbetciotu,malt,mayalanma,tarifler,beerxml,bjcp' },
  { code: 'el', name: 'Greek', title: 'Brewcraft — Ζυθοποιία στο Σπίτι', subtitle: 'Ημερολόγιο ζυθοποίησης', keywords: 'μπυρα,ζυθοποιια,σπιτι,λυκισκος,βυνη,ζυμωση,συνταγες,beerxml' },
  { code: 'id', name: 'Indonesian', title: 'Brewcraft — Asisten Pembuat Bir', subtitle: 'Buku catatan fermentasi & timer', keywords: 'bir,pembuatan,fermentasi,kalkulator,resep,craft,beerxml,bjcp' },
  { code: 'ms', name: 'Malay', title: 'Brewcraft — Pembancuh Bir Kraf', subtitle: 'Log kelompok & pemasa bancuh', keywords: 'bir,kraf,penapaian,kalkulator,resipi,bancuhan,beerxml,bjcp' },
  { code: 'vi', name: 'Vietnamese', title: 'Brewcraft — Nấu Bia Thủ Công', subtitle: 'Nhật ký mẻ nấu và hẹn giờ', keywords: 'bia,thucong,naubia,lenmen,hoabia,machnha,congthuc,beerxml' },
  { code: 'ja', name: 'Japanese', title: 'Brewcraft — クラフトビール醸造', subtitle: '仕込みタイマーと醸造記録', keywords: 'ビール,醸造,クラフトビール,仕込み,発酵,ホップ,モルト,比重計,beerxml,bjcp' },
  { code: 'ko', name: 'Korean', title: 'Brewcraft — 홈브루잉 맥주 양조', subtitle: '양조 타이머 및 배치 일지', keywords: '맥주,양조,홈브루잉,수제맥주,발효,비중계,홉,몰트,레시피,beerxml,bjcp' },
  { code: 'zh-Hant', name: 'Traditional Chinese', title: 'Brewcraft — 精釀啤酒釀造助手', subtitle: '釀造計時與批次記錄日誌', keywords: '啤酒,自釀,精釀,釀造,發酵,比重計,啤酒花,麥芽,配方,beerxml,bjcp' }
];

const metadata = locales.map(l => ({
  locale: l.code,
  language: l.name,
  app_store: {
    title: l.title.slice(0, 30),
    subtitle: l.subtitle.slice(0, 30),
    promotional_text: "100% Offline-first craft brewing assistant with Tilt BLE hydrometer support, BeerXML 1.0, BJCP 2021, and zero-tracking privacy guarantee.".slice(0, 170),
    keywords: l.keywords.slice(0, 100),
    support_url: "https://github.com/lkarwowski494/piwowar",
    marketing_url: "https://github.com/lkarwowski494/piwowar"
  }
}));

const targetPath = path.resolve(__dirname, '../docs/app-store-metadata-35-locales.json');
fs.writeFileSync(targetPath, JSON.stringify(metadata, null, 2), 'utf8');
console.log(`Successfully generated App Store metadata for 35 locales at docs/app-store-metadata-35-locales.json`);
