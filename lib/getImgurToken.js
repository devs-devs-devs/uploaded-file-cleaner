module.exports = () => {
    return new Promise((resolve,reject) => {
        imgur._getAuthorizationHeader().then(res => {
            env.IMGUR_TOKEN = res;
            resolve();
        }, (err) => reject(err));
    });
};