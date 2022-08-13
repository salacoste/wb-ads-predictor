const WBApi = require('wb-private-api')
const Constants = require('wb-private-api/src/Constants')

const wbapi = new WBApi()

async function init(dest, destDesc) {
  const KEYWORD = 'менструальная чаша';
  const ads = await wbapi.getSearchAds(KEYWORD)
  const catalog = await wbapi.search(KEYWORD, 1)
  const productIds = ads.adverts.map((ad) => ad.id);
  const nmsDeliveryData = await wbapi.getDeliveryDataByNms({
    productIds,
    dest,
  });

  nmsDeliveryData.forEach((product) => {
    const idx = ads.adverts.findIndex((ad) => ad.id === product.id);
    if (idx === -1) return;
    ads.adverts[idx] = {
      time1: product.time1,
      time2: product.time2,
      brand: product.brand,
      deliveryHours: product.time1 + product.time2,
      ...ads.adverts[idx],
    };
  });
  const top1 = catalog.page(1)[0];
  const maxDeliveryTime = getDeliveryTime(top1.time1 + top1.time2);

  ads.adverts = ads.adverts.filter((ad) => ad.deliveryHours < maxDeliveryTime)
  ads.adverts.sort((a, b) => a.cpm + b.cpm)
  const ads_new = ads.adverts.splice(0, 10)
  
  console.log(destDesc + " | Макс. Время Доставки: " + maxDeliveryTime)
  console.log('*************СТРАНИЦА 1*************')
  ads_new.map((ad, idx) => {
    console.log(idx + 1 + "|\t CPM:" + ad.cpm + "\t | " + ad.brand, ad.brand == 'CupLee' ? "\t <----- " + ad.deliveryHours  : "")
    if(idx == 4)
      console.log('*************СТРАНИЦА 2*************')
    if(idx == 9)
      console.log('************************************')
  })
}

init(Constants.DESTINATIONS.UFO, "Краснодар")
init(Constants.DESTINATIONS.MSK, "Москва")


function getDeliveryTime(t) { //47 - Сумма time1 и time2 у ТОП-1 в обычной выдаче (Satisfyer 6 + 41 = 47) 
  var e = (new Date).getHours() //5
  var r = e + t // Сумма текущих часов с t //52
  var n = 0; //2 //Делим r на 2 без остатка
  return r >= 24 && (r -= 24 * (n = Math.floor(r / 24))),
  t = 0 == n ? r < 9 ? 8 - e : r < 20 ? t : 32 - e : 1 == n && r < 9 ? 8 - e : r < 20 ? 19 - e : 43 - e,
  t += 24 * n
}