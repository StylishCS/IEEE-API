const bcrypt = require('bcrypt');

async function q(){
    console.log(await bcrypt.hash("editor", 10));
}

q();