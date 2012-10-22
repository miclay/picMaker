
/*
 * GET home page.
 */

exports.index = function(req, res) {
    res.render('index', { title: 'PicMaker' });
    //res.redirect('index.html');
};