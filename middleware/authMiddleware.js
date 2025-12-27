export default function authMiddleware(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
