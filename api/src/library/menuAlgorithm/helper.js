exports.orderObjArray = (objArray, key) => {
    for (let x = 0; x < objArray.length; x++) {
        let min = -1;
        let minIndex = 0;
        for (let y = x; y < objArray.length; y++) {
            if (objArray[y][key] < min || min === -1) {
                minIndex = y;
                min = objArray[y][key];
            }
        }
        let cache = objArray[x];
        objArray[x] = objArray[minIndex];
        objArray[minIndex] = cache;
    }
    return objArray;
};
