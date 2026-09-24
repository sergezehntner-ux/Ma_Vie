/* Ma Vie v0.3.15 — une seule recette météo pour toutes les surfaces. */
(() => {
  const FALLBACK = {
    periods:{morning:[5,10],day:[10,17],evening:[17,21],night:[21,5]},
    wmo:{clear:[0],light_cloud:[1],cloudy:[2,3],fog:[45,48],drizzle:[51,53,55,56,57],rain:[61,63,65,66,67,80,81,82],snow:[71,73,75,77,85,86],storm:[95,96,99]},
    intensity:{fog:{45:'light',48:'dense'},rain:{51:'light',53:'light',55:'medium',56:'light',57:'medium',61:'light',63:'medium',65:'heavy',66:'medium',67:'heavy',80:'light',81:'medium',82:'heavy'},snow:{71:'light',73:'medium',75:'heavy',77:'medium',85:'light',86:'heavy'},storm:{95:'medium',96:'heavy',99:'heavy'}}
  };
  let recipe=FALLBACK;
  fetch('meteo-suisse-fictive.json',{cache:'no-store'}).then(r=>r.ok?r.json():FALLBACK).then(x=>recipe=x).catch(()=>{});
  const groupFor = code => Object.keys(recipe.wmo).find(k => recipe.wmo[k].includes(+code)) || 'cloudy';
  const periodFor = h => h>=5&&h<10?'morning':h>=10&&h<17?'day':h>=17&&h<21?'evening':'night';
  const intensityFor = (group,code) => (recipe.intensity[group]||{})[code] || (group==='clear'||group==='light_cloud'?'none':'medium');
  function apply(code, hour=(new Date()).getHours()){
    const group=groupFor(code), period=periodFor(hour), intensity=intensityFor(group,+code);
    const weather = group==='clear'?'clear':group==='light_cloud'||group==='cloudy'?'cloud':group==='drizzle'?'rain':group;
    document.body.dataset.period=period;
    document.body.dataset.weather=weather;
    document.body.dataset.weatherGroup=group;
    document.body.dataset.weatherIntensity=intensity;
    return {period,group,weather,intensity,code:+code};
  }
  window.MaVieMeteo={apply,groupFor,periodFor,intensityFor,get recipe(){return recipe;}};
  // Respecte le code déjà déterminé par l'app lorsqu'il est publié dans data-weather-code.
  const code=document.body.dataset.weatherCode;
  if(code!==undefined && code!=='') apply(+code);
})();
