const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {verifyManifest,signedPayload,compareVersions}=require('../electron/update-security.cjs');
function fixture(){const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');const manifest={schemaVersion:1,version:'1.1.0',url:'https://releases.example.test/setup.exe',sha512:'a'.repeat(128),size:1000,releaseNotes:'Update'};manifest.signature=crypto.sign(null,Buffer.from(signedPayload(manifest)),privateKey).toString('base64');return {manifest,publicKey};}
test('valid signed manifest is accepted',()=>{const {manifest,publicKey}=fixture();assert.equal(verifyManifest(manifest,publicKey).version,'1.1.0');});
test('modified download URL and version are rejected',()=>{const {manifest,publicKey}=fixture();assert.throws(()=>verifyManifest({...manifest,url:'https://other.example/setup.exe'},publicKey));assert.throws(()=>verifyManifest({...manifest,version:'9.0.0'},publicKey));});
test('unsigned update and plain HTTP download are rejected',()=>{const {manifest,publicKey}=fixture();assert.throws(()=>verifyManifest({...manifest,signature:''},publicKey));assert.throws(()=>verifyManifest({...manifest,url:'http://example.test/a.exe'},publicKey));});
test('version ordering handles multi-digit components and prevents downgrades',()=>{assert.equal(compareVersions('1.10.0','1.9.9'),1);assert.equal(compareVersions('1.0.0','1.1.0'),-1);assert.equal(compareVersions('1.0.0','1.0.0'),0);assert.throws(()=>compareVersions('bad','1.0.0'));});
const {buildChannel}=require('../scripts/configure-github-channel.cjs');
test('release channel contains only public key and accepts manifests from the matching signing key',()=>{
 const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');const pem=privateKey.export({type:'pkcs8',format:'pem'});
 const channel=buildChannel('test-owner/test-releases',pem);
 assert.equal(channel.feedUrl,'https://github.com/test-owner/test-releases/releases/latest/download/latest.json');
 assert(!JSON.stringify(channel).includes('PRIVATE KEY'));
 assert.equal(channel.publicKey,publicKey.export({type:'spki',format:'pem'}));
 const manifest={schemaVersion:1,version:'1.1.0',url:'https://github.com/test-owner/test-releases/releases/download/v1.1.0/setup.exe',sha512:'b'.repeat(128),size:2000};
 manifest.signature=crypto.sign(null,Buffer.from(signedPayload(manifest)),privateKey).toString('base64');
 assert.equal(verifyManifest(manifest,channel.publicKey).version,'1.1.0');
});
test('release setup rejects malformed repository names and non-Ed25519 keys',()=>{
 const {privateKey}=crypto.generateKeyPairSync('ed25519');const pem=privateKey.export({type:'pkcs8',format:'pem'});
 assert.throws(()=>buildChannel('../../bad',pem));
 const rsa=crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'});assert.throws(()=>buildChannel('owner/repo',rsa));
});
