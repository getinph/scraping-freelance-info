const fs = require('fs');
const https = require('https');
const util = require('util')

init();

async function init() {
    console.log("scrapping Freelance-info.fr");

    console.log('extract link list');
    let fullRemote = [];
    // const links = await getLinks('https://www.freelance-info.fr/missions?keywords=jee&remote=1&page=');
    const links = await getLinks('https://www.freelance-info.fr/missions?keywords=angular&remote=1&page=');

    console.log('extract remote info');
    for (link of links) {
        console.log(links.indexOf(link)+1 + " / " + links.length);
        const mission = await getSearchPage('https://www.freelance-info.fr' + links[0]);
        let remoteData = mission.split('Télétravail :')[1].split('%')[0].match(/\d/g).join('');
        console.log('extract : ' + remoteData);
        if (remoteData == 100) {
            fullRemote.push();
            const appendFile = util.promisify(fs.appendFile);
            await appendFile("file.txt", link + '\n'); 
            console.log(link);
        }   
    }
}

async function getLinks(url) {
    return new Promise(async (resolve, rej) => {
        let links = [];
        let index = 1;
        let endSearchResult = false;
        while (!endSearchResult) {
            const page = (await getSearchPage(url + index)).toString();
            if (page.match(/Désolé, actuellement aucune mission ne correspond à vos critères./g)) {
                endSearchResult = true;
            } else {
                links.push(...extractLinkList(page));
            }
            index++;
        }
        console.log(links);
        resolve(links);
    })
}

async function getSearchPage(url) {
    return new Promise((resolve, rej) => {
        https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            resolve(data);
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    });
}

function extractLinkList(data) {
    let links = [];
    let hrefList = data.split('href');
    hrefList.shift();
    hrefList.forEach(element => {
        let link = element.split('\"')[1];
        if (link?.split('/')[1] == 'mission') {
            if (links[links.length-1] != link) {
                console.log(link)
                links.push(link)
            }
        }
    });
    return links;
}
