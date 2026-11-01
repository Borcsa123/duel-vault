export function rarityLabel(rarity:string,fullArt:boolean){
 const base=rarity.replace(/\s*·\s*Full Art/gi,'').trim();
 return fullArt?base+' · Full Art':base;
}
