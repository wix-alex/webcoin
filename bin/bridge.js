#!/usr/bin/env node

var Networks = require('bitcore').Networks
var Node = require('../lib/node.js')
var Wallet = require('../lib/wallet.js')

var node = new Node({
  network: Networks.testnet,
  path: 'data',
  acceptWeb: true
})
node.on('error', function (err) {
  console.error(err)
})

node.peers.on('peer', function (peer) {
  console.log('Connected to peer:', peer.remoteAddress, peer.subversion)
  peer.on('disconnect', function () {
    console.log('Disconnected from peer:', peer.remoteAddress, peer.subversion)
  })
})

node.chain
  .on('sync', function (tip) {
    var max = node.chain.syncHeight
    if (!max && node.chain.downloadPeer) max = node.chain.downloadPeer.bestHeight
    console.log('Sync progress:', tip.height + ' / ' + max,
      '(' + (Math.round(tip.height / max * 1000) / 10) + '%)',
      '-', new Date(tip.header.time * 1000))
  })
  .on('synced', function (tip) {
    console.log('Chain up-to-date. height: ' + tip.height
      + ', hash: ' + tip.header.hash)
  })
  .on('block', function (block) {
    if (node.chain.syncing) return
    console.log('Received a new block. height: ' + block.height
      + ', hash: ' + block.header.hash)
  })
node.start()

var w = new Wallet({ path: 'data', id: 'main', node: node }, function (err) {
  if (err) return console.error(err)
  console.log(w.getAddress())
})
