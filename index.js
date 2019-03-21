const fetch = require('node-fetch');
const Octokit = require('@octokit/rest');
const cheerio = require('cheerio');

const octokit = new Octokit({
    auth: 'token xxx',
});

const name = 'able8';
const email = 'xxx';
const repo = 'xxx';

module.exports.handler = function(event, context, callback) {
    fetch('https://github.com/trending')
        .then(res => res.text())
        .then(data => {
            const $ = cheerio.load(data);
            const rawContent = $('.repo-list li')
                .map((i, el) => {
                    const titleEl = $(el).find('h3 a');
                    return `1. [${titleEl
                        .children()
                        .text()}**${titleEl
                        .children()[0]
                        .next.data.trim()}**](https://github.com${titleEl.attr('href')}) : ${$(el)
                        .find('.py-1 p')
                        .text()
                        .trim()}`;
                })
                .get()
                .join('\n');

            const fileName = new Date().toISOString().substr(0, 16) + '.md';
            const content = Buffer.from(rawContent).toString('base64');

            octokit.repos
                .createFile({
                    owner: name,
                    repo,
                    path: fileName,
                    message: fileName,
                    content,
                    'committer:name': name,
                    'committer:email': email,
                    'author:name': name,
                    'author:email': email,
                })
                .then(() => {
                    callback(null, '');
                });
        });
};