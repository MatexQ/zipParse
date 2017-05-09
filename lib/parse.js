'use strict';
const unzip     = require('unzip');
const cheerio   = require('cheerio');
const Readable  = require('stream').Readable;
const crypto    = require('crypto');
const p         = require('bluebird');
const _         = require('lodash');
const helpers   = require('./helpers');
const settings    = require('./settings');

let config = null;

const init = (options) => {

    config = {
        path: {
            img: {
                absolute: (options.path.img) ? options.path.img.absolute : options.path.absolute,
                relative: (options.path.img) ? options.path.img.relative : options.path.relative
            },
            html: {
                absolute: (options.path.html) ? options.path.html.absolute : options.path.absolute,
                relative: (options.path.html) ? options.path.html.relative : options.path.relative
            }
        }
    };

    return {
        parse: parse
    }
};

const parse = file => {
    return new p((resolve, reject) => {
        let packageContent = {
            html: '',
            images: {},
        };

        file
            .pipe(unzip.Parse())
            .on('entry', entry => {

                let wholeData = Buffer('');
                const ext = _.head(entry.path.match(settings.ext));

                entry.on('error', code => helpers.rejectOnError(entry, code || 'Your upload has failed.', reject));
                entry.on('data', data => {
                    wholeData = Buffer.concat([wholeData, data]);
                });

                if (settings.documentTypes.indexOf(ext) !== -1) {
                    entry.on('end', () => {
                        packageContent.html = wholeData;
                    });
                } else if (_.includes(settings.images['image-types'], ext)) {
                    entry.on('end', () => {
                        packageContent.images[helpers.getFileName(entry.path)] = {
                            data: wholeData,
                            ext
                        }
                    });
                }
            })
            .on('close', () => {
                let imagesPath = null;
                helpers.saveImages(packageContent.images, config.path)
                    .then(images => {imagesPath = images; return helpers.htmlParser(packageContent.html, images)})
                    .then(html => {
                        const file = new Readable();
                        file.push(html);
                        file.push(null);

                        let thumbnails = _.filter(imagesPath, key =>  /thumbnail\.(jpg|png|jpeg)/gi.test(key.old_name));
                        imagesPath = _.map(thumbnails, thumbnail => _.without(imagesPath, thumbnail));

                        return helpers.saveHtml(config.path, file)
                            .then(html => _.assign({
                                html,
                                thumbnail: thumbnails,
                                images: imagesPath,
                            }))
                    })
                    .then(resolve)
                    .catch(reject);
            })
    })
};

module.exports = {
    init: init
};
