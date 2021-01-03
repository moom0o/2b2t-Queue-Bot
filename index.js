const snekfetch = require("snekfetch")
const mineflayer = require("mineflayer")
const mc = require("minecraft-protocol");
const Socks = require('socks5-client')

const config = require("./config.json")
const fs = require("fs");
const proxyHost = "sex"
const proxyPort = 1439

if (config.altening) {
    alts = []
    setInterval(() => {
        snekfetch.get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`).then(n => {
            if(!alts.includes(n.body.token)){
                run(n.body.token, "a")
                alts.push(n.body.token)
            }
        });
    }, config.loginintervalms)
} else {
    fs.readFile("accounts.txt", 'utf8', function (err, data) {
        if (err) throw err;
        const lines = data.split(/\r?\n/);
        setInterval(() => {
            if (lines[0]) {
                run(lines.pop().split(":")[0], lines.pop().split(":")[1])
            }
        }, config.loginintervalms)
    });
}

function run(email, password) {
    console.log("STARTING")
    let bot = mineflayer.createBot({
        stream: Socks.createConnection({
            host: config.ip,
            port: config.port,
            socksHost: proxyHost,
            socksPort: proxyPort
        }),
        username: email,
        password: password,
        version: config.version,
        plugins: {
            conversions: false,
            furnace: false,
            math: false,
            painting: false,
            scoreboard: false,
            villager: false,
            bed: false,
            book: false,
            boss_bar: false,
            chest: false,
            command_block: false,
            craft: false,
            digging: false,
            dispenser: false,
            enchantment_table: false,
            experience: false,
            rain: false,
            ray_trace: false,
            sound: false,
            tablist: false,
            time: false,
            title: false,
            physics: config.physics,
            blocks: true
        }
    });
    bot.on('login', () => {
        setInterval(() => {
            bot.chat("/queue main")
        }, 1000)
        console.log("Logged in " + bot.username)
    });
    bot.on('error', err => console.log(err))
    bot.on('kicked', function (reason) {
        console.log("I got kicked for", reason, "lol");
    });
}