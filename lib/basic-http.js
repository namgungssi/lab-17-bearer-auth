'use strict';



module.exports = (req, res, next) => {

  try {
    let authHeader = req.headers.authorization;
    let base64Header = authHeader.split('Basic ')[1];
    let base64Buf = new Buffer(base64Header, 'base64');
    let stringHeader = base64Buf.toString();
    let authArray = stringHeader.split(':');
    let authObj =  {

      username: authArray[0],
      password: authArray[1],
    };


    if (!authObj.username || !authObj.password) throw new Error('Error: username and password required!');
    req.auth = authObj;
    next();
  }


  catch(err) { next(err); }
};
