// Funktion zur Überprüfung der Passwortkomplexität
const isPasswordComplex = (password) => {
  // Mindestlänge 8 Zeichen
  if (password.length < 8) {
    return false;
  }
  // Mindestens einen Großbuchstaben enthalten
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  // Mindestens einen Kleinbuchstaben enthalten
  if (!/[a-z]/.test(password)) {
    return false;
  }
  // Mindestens eine Zahl enthalten
  if (!/\d/.test(password)) {
    return false;
  }
  // Mindestens ein Sonderzeichen enthalten
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }
  return true;
};

module.exports = isPasswordComplex;
