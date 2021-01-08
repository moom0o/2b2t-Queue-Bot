const snekfetch = require("snekfetch")
const mineflayer = require("mineflayer")
const mc = require("minecraft-protocol");
const socks = require('socks').SocksClient
const ProxyAgent = require('proxy-agent')

const config = require("./config.json")
const fs = require("fs");
const proxy_list = fs.readFileSync(`./proxies.txt`, 'utf-8')
let proxies = proxy_list.split(/\r?\n/)

if (config.altening) {
    alts = []
    setInterval(() => {
        snekfetch.get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`).then(n => {
            if (!alts.includes(n.body.token)) {
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

function run(email, password, int) {
    let combo = [email, password]
    if(!proxies[0]){
        return console.log("Not logging in, out of proxies.")
    }
    let proxy = proxies.pop()
    let proxycombo = proxy.split(":")
    console.log(proxycombo)
    console.log("STARTING")
    const client = mc.createClient({
        connect: client => {
            socks.createConnection({
                proxy: {
                    host: proxycombo[0],
                    port: parseInt(proxycombo[1]),
                    type: config.socks_version
                },
                command: 'connect',
                destination: {
                    host: config.ip,
                    port: config.port
                }
            }, (err, info) => {
                if (err) {
                    console.log(err)
                }

                client.setSocket(info.socket)
                client.emit('connect')
            })
        },
        host: config.ip,
        agent: new ProxyAgent({protocol: config.socks_version2 + ":", host: proxycombo[0], port: proxycombo[1]}),
        username: email,
        password: password,
        version: config.version
    })
    client.on('packet', function (packet) {
        if (config.log_packets) {
            console.log(packet)
            if (packet.data) {
                console.log(packet.data.toString())
            }
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
    client.on('error', function (error){
        if(!error.toString().includes("Invalid credentials")){
            if(int){
                run(combo[0], combo[1], int)
            } else {
                run(combo[0], combo[1], 1)
            }
        } else {
            if(int){
                if(int < config.maxattemptsperproxy){
                    run(combo[0], combo[1], int+1)
                } else {
                    return console.log("max attempts reached")
                }
            } else {
                run(combo[0], combo[1], int+1)
            }
        }
        console.log(error.toString())
    })
}