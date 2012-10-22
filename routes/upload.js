
/*
 * upload image
 */

var fs = require('fs');

var exfn = function(req, res) {
    req.session.uid = req.session.uid ?
        req.session.uid :
        new Date().getTime() + parseInt(Math.random() * 1000000);
    exfn.uid = req.session.uid;
    var file_name = req.files.img_file.name;
    var temp_path = req.files.img_file.path;
    var target_path = './public/temp/bg' + req.session.uid + '.png';
    fs.rename(temp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(temp_path, function() { });
        res.render('stage', { bg: 'temp/bg' + req.session.uid + '.png' });
    });
};
exports.upload = exfn;