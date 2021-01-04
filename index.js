const snekfetch = require("snekfetch")
const mineflayer = require("mineflayer")
const mc = require("minecraft-protocol");
const socks = require('socks').SocksClient
const ProxyAgent = require('proxy-agent')

const config = require("./config.json")
const fs = require("fs");
const proxyHost = "69.69.69.69"
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
                const line = lines.pop()
                run(line.split(":")[0], line.split(":")[1])
            }
        }, config.loginintervalms)
    });
}

function run(email, password) {
    let combo = [email, password]
    console.log("STARTING")
    const client = mc.createClient({
        connect: client => {
            socks.createConnection({
                proxy: {
                    host: proxyHost,
                    port: parseInt(proxyPort),
                    type: 5
                },
                command: 'connect',
                destination: {
                    host: config.ip,
                    port: config.port
                }
            }, (err, info) => {
                if (err) {
                    console.log(err)
                    return
                }

                client.setSocket(info.socket)
                client.emit('connect')
            })
        },
        host: config.ip,
        agent: new ProxyAgent({ protocol: 'socks5:', host: proxyHost, port: proxyPort }),
        username: email,
        password: password,
        version: config.version
    })
    client.on('packet', function (packet){
        if(config.log_packets){
            console.log(packet)
        }
    })
    client.on('connect', function () {
        console.info('connected')
    })
    client.on('disconnect', function (packet) {
        console.log('disconnected: ' + packet.reason)
    })
    client.on('end', function () {
        console.log('Connection lost')
    })
    client.on('message', function (packet) {
        console.log(packet.toString())
    })
}