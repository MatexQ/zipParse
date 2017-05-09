'use strict';
const crypto = require('crypto');
const fsExtra = require('fs-extra-promise');
const p = require('bluebird');
const _ = require('lodash');
const cheerio = require('cheerio');


const saveImages = (images, path) => {
    const absPath = path.img.absolute;
    return fsExtra.ensureDirAsync(absPath)
        .then(() => absPath)
        .then(absPath => _.keys(images))
        .map(key => _.assign({old_name: key}, images[key]))
        .map(img => _.assign(img, {filename: `${randomString(10)}.${img.ext}`}))
        .map(img => _.assign(img, {
            absolutePath: `${path.img.absolute}/${img.filename}`,
            relativePath: `${path.img.relative}/${img.filename}`
        }))
        .then(images => {
            const promises = images.map(img => fsExtra.writeFileAsync(img.absolutePath, img.data));
            return p.all(promises)
                .then(() => images.map(img => _.omit(img, ['data', 'ext'])));
        });
};

const rejectOnError = (entry, code, reject) => {
    entry.pause();
    entry.removeAllListeners('entry');
    const err = Error();
    err.code = code;
    reject(err);
};

const getFileName = fp => fp.split(/\/|\\/).pop();

const randomString = amountChars => crypto.randomBytes(amountChars).toString('hex');

const saveHtml = (path, file) => fsExtra.ensureDirAsync(path.html.absolute)
    .then(() => {
        const filename = randomString(10);
        return {
            absolutePath: `${path.html.absolute}/${filename}.html`,
            relativePath: `${path.html.relative}/${filename}.html`
        }
    })
    .then(path => getFileContent(file)
        .then(data => fsExtra.writeFileAsync(path.absolutePath, data, 'utf8'))
        .then(() => path));


const getFileContent = file => new p((resolve, reject) => {
    let wholeData = Buffer('');
    file.on('data', (data, err) => {
        if (err) {
            reject(err);
        }

        wholeData = Buffer.concat([wholeData, data]);
    });
    file.on('end', () => {
        resolve(wholeData);
    });
});

const htmlParser = (html, images) => new p((resolve, reject) => {
    if (html && html.indexOf('html') !== -1) {
        const $ = cheerio.load(html, {decodeEntities: false});

        _.forEach(images, img => {
            $("img[src$='" + img.old_name + "']").each(function () {
                const originalSrc = $(this).attr('src');

                $(this).attr("src", `${img.old_name ? img.relativePath : originalSrc}`);
            });
        });

        html = $.html();
        resolve(html);
    } else {
        resolve(html);
    }
});


module.exports = {
    getFileName,
    randomString,
    saveImages,
    htmlParser,
    saveHtml,
    rejectOnError
};