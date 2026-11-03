const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
test('ASAR v3 resolves platform-native asset paths on Windows and Linux',()=>{
 const file=require.resolve('@electron/asar/lib/filesystem.js'),source=fs.readFileSync(file,'utf8'),nativeRequire=createRequire(file);
 for(const platformPath of [path.win32,path.posix]){
  const sandbox={exports:{},require:id=>id==='path'?platformPath:nativeRequire(id),Buffer,process,console};vm.runInNewContext(source,sandbox,{filename:file});const Filesystem=sandbox.exports.Filesystem,archive=new Filesystem(platformPath.resolve('archive'));
  const expected={size:859170,offset:'0'};archive.header={files:{dist:{files:{models:{files:{'blue-eyes':{files:{'model.txt':expected}}}}}}}};
  assert.equal(archive.getFile(platformPath.join('dist','models','blue-eyes','model.txt')),expected);
  if(platformPath===path.win32)assert.throws(()=>archive.getFile('dist/models/blue-eyes/model.txt'));
 }
});
test('packaging hook uses platform-native archive entries and keeps missing-asset protection',async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../scripts/after-pack.cjs'),'utf8');
 for(const platformPath of [path.win32,path.posix]){
  const seen=[],sandbox={module:{exports:{}},require:id=>id==='node:path'?platformPath:id==='node:fs'?{readdirSync:()=>[],mkdirSync:()=>{},writeFileSync:()=>{}}:id==='@electron/asar'?{extractFile:(_archive,asset)=>{seen.push(asset);assert.equal(asset,platformPath.join(...asset.split(/[\\/]/)));return Buffer.alloc(2000);}}:require(id)};
  vm.runInNewContext(source,sandbox);await sandbox.module.exports({appOutDir:platformPath.resolve('app'),packager:{projectDir:platformPath.resolve('project')}});assert.equal(seen.length,2);
 }
});
