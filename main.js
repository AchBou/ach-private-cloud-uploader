import dotenv  from 'dotenv'
dotenv.config()

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar'

import {listAllFiles} from "./functions/listFiles.js";
import {uploadFile} from "./functions/uploadFile.js";



async function uploadAndDelete(file){
    try{
        const relativePath = '\\upload-zone\\'+file
        let filePath= path.resolve()+relativePath
        await uploadFile(filePath);
        console.log('file '+ relativePath + ' uploaded')
        fs.unlinkSync(filePath);
        console.log('file '+ relativePath + ' deleted')
    }
    catch(err) {
        console.error(err)
    }
}

async function main(){
    let dir = "/upload-zone"
    let filenames = fs.readdirSync(path.resolve()+dir);
    for (const file of filenames) {
        //console.log('initial call path', file)
        await uploadAndDelete(file)
    }

    const data = await listAllFiles();
    //console.log(data)
    console.log('Files currently in the warehouse: '+data.Contents.length)
}

main().then(() => {
    chokidar.watch('.',{cwd:'./upload-zone'}).on('add', (file) => {
        uploadAndDelete(file)
    });
}).catch(err=>{
    console.log('An error has occurred ==>', err)
});

