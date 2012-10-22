
/*
 * GET home page.
 */

exports.run = function(req, res) {
    res.render('stage', { bg: req.session.uid || '' });
};