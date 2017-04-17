class Utils {
    static generateUUID(length) {
        let buf = [];
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charLen = chars.length;

        for (let i = 0; i < length; ++i)
            buf.push(chars[Utils.getRandomInt(0, charLen - 1)]);

        return buf.join('');
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = Utils;