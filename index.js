require('dotenv').config();
process.chdir(__dirname);

const slack = require('slack');
const imgur = require('imgur');
const imgurUploader = require('imgur-uploader');
const fs = require('fs');
const request = require('request');
const env = process.env;
const slackToken = {token:env.SLACK_TOKEN};
const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];

imgur.setCredentials(env.IMGUR_EMAIL, env.IMGUR_PASSWORD, env.IMGUR_CLIENT);
imgur.getAlbumInfo(env.IMGUR_ALBUM).then(()=>{

    imgur._getAuthorizationHeader().then(header=> {
        env.IMGUR_TOKEN = header;

        slack.users.list(slackToken, (err,data) => {
    
            const users = data.members;

            slack.files.list(slackToken, (err,data) => {
                
                filesToPurge = data.files.filter(file => allowedTypes.indexOf(file.filetype) > -1 && file.created * 1000 < (+new Date() - (86400000 * 7)));
                
                filesToPurge.length = 5; // maximum of 1 files a time.

                filesToPurge.forEach(file => {

                    const filePath = `${file.id}.${file.filetype}`;

                    request({
                        url:file.url_private_download,
                        headers:{
                            Authorization: 'Bearer '+env.SLACK_TOKEN
                        }
                    }).pipe(fs.createWriteStream(filePath)).on('close', () => {

                        imgurUploader(fs.readFileSync(filePath), {
                                title:'Uploaded by @'+users.filter(user => user.id === file.user)[0].name+' on '+(new Date(file.created).toISOString()),
                                album:env.IMGUR_ALBUM,
                                token:env.IMGUR_TOKEN
                            }).then(json => {
                                slack.files.delete({token: env.SLACK_TOKEN, file:file.id}, (err,res) => {
                                    if (err) return;
                                    fs.unlinkSync(filePath);
                                });

                            }, err=> {
                                console.log('err', err);
                            });

                    });

                });

            });

        });

    }, console.log);
    
}, console.log);