const dataQueue = [];

function queueData(data) {
  dataQueue.push(data);
}

function generateData() {
  return new Promise((resolve, reject) => {
    const returnData = {};

    for (let i = 0; i < dataQueue.length; i += 1) {
      const data = dataQueue[i];
      const existing = returnData[data.name];

      if (!existing) {
        returnData[data.name] = data.value;
      } else if (returnData[data.name] !== data.value) {
        reject('duplicate key names but different values.');
      }
    }

    resolve(returnData);
  });
}

module.exports = {
  queueData,
  generateData
};
