function miniMaxSum(arr = [1, 2, 3, 4, 5]) {
    const fullSum = arr.reduce((prev, curr) => {
        return prev + curr;
    }, 0);

    let min = fullSum, max = 0;

    arr.forEach((item) => {
        const sum = fullSum - item;
        if (sum < min) {
            min = sum;
        }
        if (sum > max) {
            max = sum;
        }
    });

    console.log(`${min} ${max}`);
}

miniMaxSum();
