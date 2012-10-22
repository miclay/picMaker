
/**
 * Module dependencies.
 */

var express = require('express')
    , fs = require('fs')
    , gm = require('gm');

exports.quality = function(app, server, io) {
    io.sockets.on('connection', function(socket) {
        socket.on('upload', function(str) {
            var uid = require('../routes/upload').upload.uid || '';
            var base64Data = str.replace(/^data:image\/png;base64,/, "");
            var dataBuffer = new Buffer(base64Data, 'base64');
            var imagePath = "public/temp/";
            var srcPath = imagePath + 'out_' + uid + '.png';
            fs.writeFile(srcPath, dataBuffer, function(err) {
                if (err) throw err;
                var quality = 90;
                var makeOnce = function() {
                    var dst_path = './' + imagePath + 'pic' + quality + '_' + uid + '.jpg';
                    gm('./' + srcPath)
                .quality(quality)
                .write(dst_path, function(err) {
                    if (err) throw err;
                    gm(dst_path).identify(function(err, data) {
                        if (err) throw err;
                        socket.emit('sending', { quality: quality, url: 'temp/pic' + quality + '_' + uid + '.jpg', size: data.Filesize });
                        quality -= 5;
                        if (quality >= 40) {
                            makeOnce();
                        } else {
                            socket.emit('complete', {});
                        }
                    });
                });
                }; //makeOnce
                makeOnce();
            }); //end fs.writeFile
        });
    });
};