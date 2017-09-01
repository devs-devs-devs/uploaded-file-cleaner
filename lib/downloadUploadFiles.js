const fs = require('fs');
const request = require('request');
const imgurUploader = require('imgur-uploader');
const iw = require('slack-incoming-webhook');

const deleteFile = (file, resolve, json) => {
    const filePath = `${file.id}.${file.filetype}`;
    console.log('Deleting file', filePath);
    slack.files.delete({token: env.SLACK_TOKEN, file:file.id}, (err,res) => {
        resolve();

        const messageChannel = (message) => {
            const send = iw({
                url:env.SLACK_INCOMING_WEBHOOK
            })(message, {
                "channel":"#imagearchive",
                "username":"Your mother who tidys up after you",
                "icon_emoji": ":sad-brittany:",
            });
        };

        messageChannel(err ? err.toString() : json ? `${json.title} - ${json.link}` : 'Sumting wong');

        if (err) return;
        try {
            fs.unlinkSync(filePath);
        } catch(e) {
            console.log(e);
        }
    });
}

module.exports = (files) => {

    return new Promise((resolve,reject) => {

        files.forEach(file => {

            console.log('FILE', file);
            
            if (file.filetype.indexOf('png','jpg','gif','jpeg') === -1) {
                console.log('not image');
                return deleteFile(file, resolve);
            }

            const filePath = `${file.id}.${file.filetype}`;

            request({
                uri:file.url_private_download,
                headers:{
                    Authorization: `Bearer ${env.SLACK_TOKEN}`
                }
            })
            .pipe(fs.createWriteStream(filePath))
            .on('close', () => {

                imgurUploader(fs.readFileSync(filePath), {
                    title:'Uploaded by @'+users.filter(user => user.id === file.user)[0].name+' on '+(new Date(file.created*1000).toISOString()),
                    album:env.IMGUR_ALBUM,
                    token:env.IMGUR_TOKEN
                }).then(json => {
                    console.log(json);
                    deleteFile(file, resolve, json);
                }, err => {
                    resolve();
                    console.log('err', err);
                });

            }, err => {
                console.log('request err', err);
                resolve();
            })

        })

    });

}