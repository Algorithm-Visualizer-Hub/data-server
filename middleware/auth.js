import jwt from "jsonwebtoken"

export default function (req, res, next) {
  const token = req.header('AuthToken')
  if (!token) {
    return res.status(401).send('Access denied. No token provided.')
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).send('Access denied. Invalid token.')
  }
}