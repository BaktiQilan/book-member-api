function array(INPUT, QUERY) {
  const frequencyMap = INPUT.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  const result = QUERY.map((queryItem) => frequencyMap[queryItem] || 0);

  return result;
}

const INPUT = ['xc', 'dz', 'bbb', 'dz'];
const QUERY = ['bbb', 'ac', 'dz'];
const output = array(INPUT, QUERY);
console.log(output);
