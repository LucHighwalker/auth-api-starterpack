const auth = require('../auth/auth.controller');

function render(res, token, path, requireUser = false, optParams = null) {
  let params = {};

  if (optParams !== null) {
    params = Object.assign(params, optParams);
  }

  if (requireUser && token === undefined) {
    res.redirect('/api/auth/login');
  } else {
    auth.getUser(token).then((curUser) => {
      params.user = curUser;
      res.render(path, params);
    }).catch((error) => {
      res.json({
        error
      });
    });
  }
}

module.exports = {
  render
};
