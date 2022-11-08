const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {    
    axios
        .get('http://hk.unnes.ac.id/simprokum/pr')
        .then(response => {
            if(response.status === 200) {
                const $ = cheerio.load(response.data);
                return fetchData($, 'Peraturan Rektor');
            }
        })
        .then(pr => {
            axios
                .get('http://hk.unnes.ac.id/simprokum/kr')
                .then(response => {
                    if(response.status === 200) {
                        const $ = cheerio.load(response.data);
                        return fetchData($, 'Keputusan Rektor');
                    }
                })
                .then(kr => {
                    let all = [];
                    all = all.concat(pr, kr);
                    res.json(all);
                })
                .catch(error => {
                    console.log(error);
                })
        })
        .catch(error => {
            console.log(error);
        })
});

app.use((req, res, next) => {
    res.status(404).send('Route is not found!');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}...`);
});

function fetchData($, type = '') {
    let data = [];
    $('#tableku tbody tr').each(function(i, elem) {
        data[i] = {
            nomor: $(elem).find('td:nth-child(2)').text(),
            tentang: $(elem).find('td:nth-child(3)').text(),
            masalah: $(elem).find('td:nth-child(4)').text(),
            file: $(elem).find('td:nth-child(5) a').attr('href'),
            tipe: type
        };
    });
    data = data.filter(n => n !== undefined);
    return data;
}