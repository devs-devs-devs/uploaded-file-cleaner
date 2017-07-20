module.exports = () => {
    return new Promise((resolve,reject) => {
        slack.users.list({token:env.SLACK_TOKEN}, (err,data) => {
            if (err) return reject(err);
            resolve(data.members);
        });
    });
};