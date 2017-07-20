require('dotenv').config();
require('./lib/funcs.js');
process.chdir(__dirname);
const slack = global.slack = require('slack');
const imgur = global.imgur = require('imgur');
const fs = require('fs');
const env = global.env = process.env;

imgur.setCredentials(env.IMGUR_EMAIL, env.IMGUR_PASSWORD, env.IMGUR_CLIENT);

let users = [];

// Calling this forces a login
imgur.getAlbumInfo(env.IMGUR_ALBUM)
    .then(getImgurToken)
    .then(getSlackUsers)
    .then(slackUsers => {
        users = slackUsers;
    })
    .then(getSlackFiles)
    .then(downloadUploadFiles)
    .then(() => console.log('done, i think'));