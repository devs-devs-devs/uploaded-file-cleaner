const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];

module.exports = () => {
    return new Promise((resolve,reject) => {
        slack.files.list({token:env.SLACK_TOKEN}, (err,data) => {
            if (err) return reject(err);
            
            let filesToPurge = data.files.filter(file => {
                if (allowedTypes.indexOf(file.filetype) === -1) return true;
                if (file.created * 1000 < (+new Date() - (86400000 * 7))) return true;
                return false;
            });

            filesToPurge.reverse();

            // Hard limit
            filesToPurge.length = 5;

            resolve(filesToPurge);

        });
    });
};