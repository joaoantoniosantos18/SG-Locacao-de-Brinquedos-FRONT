// Formata qualquer string de números para (XX) XXXXX-XXXX
export const mascaraTelefone = (valor) => {
  return valor
    .replace(/\D/g, '')           // Remove tudo que não é número
    .slice(0, 11)                  // Limita a 11 dígitos
    .replace(/^(\d{2})(\d)/, '($1) $2')         // (XX) X
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')      // XXXXX-XXXX
}