const fs = require('fs');
const request = require('request');
const imgurUploader = require('imgur-uploader');

module.exports = (files) => {

    return new Promise((resolve,reject) => {

        files.forEach(file => {

            console.log(file);

            const filePath = `${file.id}.${file.filetype}`;

            request({
                url:file.url_private.download,
                headers:{
                    Authorization: `Bearer ${env.SLACK_TOKEN}`
                }
            }).pipe(fs.createWriteStream(filePath)).on('close', () => {

                console.log('request');

                imgurUploader(fs.readFileSync(filePath), {
                    title:'Uploaded by @'+users.filter(user => user.id === file.user)[0].name+' on '+(new Date(file.created*1000).toISOString()),
                    album:env.IMGUR_ALBUM,
                    token:env.IMGUR_TOKEN
                }).then(json => {
                    console.log(json);
                    slack.files.delete({token: env.SLACK_TOKEN, file:file.id}, (err,res) => {
                        resolve();
                        if (err) return;
                        fs.unlinkSync(filePath);
                    })
                }, err => {
                    resolve();
                    console.log('err', err);
                });

            }, err => {
                console.log('request err', err);
                resolve();
            });

        })

    });

}