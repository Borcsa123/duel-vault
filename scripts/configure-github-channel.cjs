const fs=require('node:fs'),crypto=require('node:crypto');
function buildChannel(repository,privateKey){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository||''))throw Error('A valid GitHub repository is required.');
 const key=crypto.createPrivateKey(privateKey);if(key.asymmetricKeyType!=='ed25519')throw Error('An Ed25519 update-signing key is required.');
 return {feedUrl:`https://github.com/${repository}/releases/latest/download/latest.json`,publicKey:crypto.createPublicKey(key).export({type:'spki',format:'pem'})};
}
if(require.main===module){
 const channel=buildChannel(process.env.GITHUB_REPOSITORY,process.env.UPDATE_SIGNING_PRIVATE_KEY);
 fs.writeFileSync('electron/release-channel.json',JSON.stringify(channel,null,2));
 console.log('Trusted GitHub update channel configured.');
}
module.exports={buildChannel};
