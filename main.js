import dotenv  from "dotenv"
dotenv.config()

import fs from "fs";
import path from "path";

import {listAllFiles} from "./functions/listFiles.js";
import {uploadFile} from "./functions/uploadFile.js";


async function main(){
    const dir = "/upload-zone/"
    let filenames = fs.readdirSync(path.resolve()+dir);

    console.log("\nCurrent directory filenames:");
    for (const file of filenames) {
        await uploadFile(path.resolve()+dir+file);
    }

    const data = await listAllFiles();
    console.log(data)
}

main().then(() => {
    console.log('done');
}).catch(err=>{
    console.log('An error has occurred ==>', err)
});

