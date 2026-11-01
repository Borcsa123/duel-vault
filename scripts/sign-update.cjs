// Run on the release maintainer's machine. Private keys never go into the app.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const {signedPayload}=require('../electron/update-security.cjs');
const [command,...args]=process.argv.slice(2);
if(command==='keygen'){
 const directory=args[0];if(!directory)throw Error('Usage: npm run updates:sign -- keygen <PRIVATE-directory>');fs.mkdirSync(directory,{recursive:true});if(fs.existsSync(path.join(directory,'private.pem')))throw Error('Key already exists.');const {privateKey,publicKey}=crypto.generateKeyPairSync('ed25519');fs.writeFileSync(path.join(directory,'private.pem'),privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600});fs.writeFileSync(path.join(directory,'public.pem'),publicKey.export({type:'spki',format:'pem'}));console.log('Keys created. Keep private.pem outside the project and release downloads.');
}else if(command==='manifest'){
 const [installer,url,keyFile,output='latest.json']=args;if(!installer||!url||!keyFile)throw Error('Usage: npm run updates:sign -- manifest <installer.exe> <HTTPS-download-url> <private.pem> [latest.json]');if(new URL(url).protocol!=='https:')throw Error('HTTPS required.');const bytes=fs.readFileSync(installer);const manifest={schemaVersion:1,version:require('../package.json').version,url,sha512:crypto.createHash('sha512').update(bytes).digest('hex'),size:bytes.length,releaseNotes:process.env.RELEASE_NOTES||''};manifest.signature=crypto.sign(null,Buffer.from(signedPayload(manifest)),fs.readFileSync(keyFile)).toString('base64');fs.writeFileSync(output,JSON.stringify(manifest,null,2));console.log(output);
}else throw Error('Choose keygen or manifest.');
