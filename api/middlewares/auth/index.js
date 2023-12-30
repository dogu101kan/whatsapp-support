const {
    isTokenIncluded,
    getAccessToken,
} = require("../../helpers/authorization/tokenHelper");
const customError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const asyncErrorWrapper = require("express-async-handler");

const { findUser } = require("../../helpers/db");

const getAccess = asyncErrorWrapper(async (req, res, next) => {
    const { JWT_SECRET_KEY } = process.env;

    if (!isTokenIncluded(req))
        return next(new customError("You are not authorized", 401));

    const accessToken = getAccessToken(req);

    jwt.verify(accessToken, JWT_SECRET_KEY, async (err, decoded) => {
        if (err)
            return next(
                new customError("You re not authorized. Token Expired", 401)
            );
        const user = await findUser(decoded.id);

        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: user.role,
        };

        if(user.status !== true)
            return next(
                new customError("Account status false", 401)
            );

        return next();
    });
});

const getAdminAccess = asyncErrorWrapper(async (req, res, next) => {
    if (req.user.role !== "ADMIN")
        return next(new customError("You don't have an access", 400));
    return next();
});

module.exports = {
    getAccess,
    getAdminAccess,
};
