const fs = require('fs');
const https = require('https');
const util = require('util');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const rl = readline.createInterface({ input, output });


init();

async function init() {
    console.log("scrapping Freelance-info.fr");

    const key = await inputKey(); 

    console.log('extract link list');
    let nbFullRemote = 0;
    const links = await getLinks(key);

    console.log('extract remote info');
    firstLineWritten = false;
    for (link of links) {
        console.log(links.indexOf(link)+1 + " / " + links.length);
        const mission = await getSearchPage('https://www.freelance-info.fr' + link);
        let remoteData = mission.split('Télétravail :')[1].split('%')[0].match(/\d/g).join('');
        console.log('extract : ' + remoteData);
        if (remoteData == 100) {
            nbFullRemote++;
            const appendFile = util.promisify(fs.appendFile);
            if (!firstLineWritten) {
                await appendFile("file.txt", '\n\n\n search : ' + key + '\nhttps://www.freelance-info.fr' + link + '\n'); 
                firstLineWritten = true;
            } else {
                await appendFile("file.txt", 'https://www.freelance-info.fr' + link + '\n'); 
            }
            console.log(link);
        }   
    }
    console.log('nombre de résulats full remote for ' + key + ' : ' + nbFullRemote);
}

async function inputKey() {
    return new Promise((resolve, rej) => {
        rl.question("Quel est le mot clef de votre recherche ?", function(url) {
            rl.close();
            resolve(url);
        });
    })
}

async function getLinks(key) {
    return new Promise(async (resolve, rej) => {
        const urlP1 = "https://www.freelance-info.fr/missions?keywords=";
        const urlP2 = "&remote=1";
        let links = [];
        let index = 1;
        let endSearchResult = false;
        let nbResult = 0;
        while (!endSearchResult) {
            const page = (await getSearchPage(urlP1 + key + urlP2 + '&page=' + index)).toString();
            
            if (page.match(/Désolé, actuellement aucune mission ne correspond à vos critères./g)) {
                endSearchResult = true;
            } else {
                if (index == 1) {
                    nbResult = page.split('total de\n\n                                ')[1].split('\n')[0];
                    console.log( nbResult+ " résultats");
                }
    
                console.log("page " + index);
                    links.push(...extractLinkList(page));
                index++;
            }
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

// async function init() {
//     console.log("scrapping Freelance-info.fr");

//     const key = await inputKey(); 

//     console.log('extract link list');
//     let fullRemote = [];
//     const links = await getLinks(key);
//     console.log('extract remote info');
//     var nbLinkfetched = 0;
//     var palier = 10;
//     var pageReq = links.map(async(link, index) => {
//         // console.log(index+1 + " / " + links.leingth);
//         const mission = (await getSearchPage('https://www.freelance-info.fr' + link)).toString();
//         let remoteData = mission.split('Télétravail :')[1];
//         let test = remoteData.split('%')[0].match(/\d/g).join('');
//         console.log('extract : ' + remoteData);
//         if (remoteData == 100) {
//             fullRemote.push();
//             const appendFile = util.promisify(fs.appendFile);
//             await appendFile("file.txt", 'https://www.freelance-info.fr' + link + '\n'); 
//             nbLinkfetched++;
//             if (nbLinkfetched / links.length * 100 > palier) {
//                 console.log(palier + '+');
//                 palier += 10;
//             }
//         }  
//     });
//     await Promise.all(pageReq).then((links) => {
//         console.log(fullRemote.length + ' annonces full remote trouvées');
//     })
// }

// async function getLinks(key) {
//     return new Promise(async (resolve, rej) => {
//         const urlP1 = "https://www.freelance-info.fr/missions?keywords=";
//         const urlP2 = "&remote=1";
//         let index = 1;
//         let endSearchResult = false;
//         let nbPage = 0;

//         const page = (await getSearchPage(urlP1 + key + urlP2 + '&page=' + 1)).toString();
//         if (!page.match(/Désolé, actuellement aucune mission ne correspond à vos critères./g)) {
//             nbResult = page.split('total de\n\n                                ')[1].split('\n')[0];
//             console.log( nbResult + " résultats");
//             nbPage = Math.trunc(nbResult / 10) +1;
//             var pageReq = Array.from({length: nbPage}, (_, i) => i + 1).map(async(element, index) => {
//                 const page = (await getSearchPage(urlP1 + key + urlP2 + '&page=' + index+1)).toString();
//                 console.log("page " + index);
//                 var links = extractLinkList(page);
//                 return links;
//             });
//             await Promise.all(pageReq).then((links) => {
//                 resolve(...links);
//             })
//         } else {
//             console.log('Désolé, actuellement aucune mission ne correspond à vos critères.');
//         }
        
//     })
// }
