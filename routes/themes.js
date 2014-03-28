exports.preview = function(req, res){
  res.render('themes/preview', { name: req.params.theme });
};
