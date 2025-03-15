// Gestionnaire d'erreurs asynchrones pour éviter try/catch partout
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler; 