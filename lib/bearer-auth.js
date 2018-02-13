'use strict';



const jwt = require('jsonwebtoken');



module.exports = (req,res,next) => {
  if(!req.headers.authorization){
    next(401);
  }

  let token = req.headers.authorization.split('Bearer ')[1];
  if(!token){
    return next(401);
  }

  let secret = process.env.APP_SECRET || 't7YaxqZ9ZdkhUF5DJubo3i71pjihz+153onOzAoT';

  //If token is bad, return 401
  let decodedToken = jwt.verify(token, secret, (err, verifiedJwt) => {

    return err ? next(401) : verifiedJwt;

  });
  req.userId = decodedToken.id;
  next();

};
