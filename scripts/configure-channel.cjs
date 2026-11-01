const fs=require('node:fs'),crypto=require('node:crypto');
const [feedUrl,publicKeyFile]=process.argv.slice(2);
if(!feedUrl||!publicKeyFile)throw Error('Usage: node scripts/configure-channel.cjs <https://.../latest.json> <public.pem>');
const url=new URL(feedUrl);if(url.protocol!=='https:'||url.username||url.password)throw Error('HTTPS URL required.');
const publicKey=fs.readFileSync(publicKeyFile,'utf8');if(crypto.createPublicKey(publicKey).asymmetricKeyType!=='ed25519')throw Error('Ed25519 key required.');
fs.writeFileSync('electron/release-channel.json',JSON.stringify({feedUrl,publicKey},null,2));console.log('Release channel configured.');
