function reverseAlphabet(str) {
  const letters = str.replace(/\d/g, '');
  const digits = str.replace(/\D/g, '');

  const reversedLetters = letters.split('').reverse().join('');

  const result = reversedLetters + digits;
  return result;
}

const input = 'NEGIE1';
const result = reverseAlphabet(input);
console.log(result);
