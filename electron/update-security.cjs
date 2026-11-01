const crypto=require('node:crypto');
function signedPayload(manifest){return JSON.stringify({schemaVersion:manifest.schemaVersion,version:manifest.version,url:manifest.url,sha512:manifest.sha512,size:manifest.size,releaseNotes:manifest.releaseNotes||''});}
function compareVersions(left,right){const parse=value=>{if(!/^\d+\.\d+\.\d+$/.test(value))throw Error('Érvénytelen verziószám.');return value.split('.').map(Number);};const a=parse(left),b=parse(right);for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i]?1:-1;}return 0;}
function verifyManifest(manifest,publicKey){
 if(!manifest||manifest.schemaVersion!==1||!/^\d+\.\d+\.\d+$/.test(manifest.version)||!Number.isSafeInteger(manifest.size)||manifest.size<1||manifest.size>800*1024*1024||typeof manifest.sha512!=='string'||!/^[a-f0-9]{128}$/.test(manifest.sha512)||typeof manifest.signature!=='string'||manifest.signature.length>256)throw Error('Érvénytelen frissítési csomagleírás.');
 const url=new URL(manifest.url);if(url.protocol!=='https:'||url.username||url.password)throw Error('A frissítéshez HTTPS-cím szükséges.');
 if(!crypto.verify(null,Buffer.from(signedPayload(manifest)),publicKey,Buffer.from(manifest.signature,'base64')))throw Error('A frissítés aláírása nem hiteles.');return manifest;
}
module.exports={signedPayload,compareVersions,verifyManifest};
