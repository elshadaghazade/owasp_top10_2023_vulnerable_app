
async function main () {

    const arr = [];

    const t1 = Date.now();
    for (let i = 0; i < 1000; i++) {
        arr.push(fetch('http://localhost:3000/api/rules_policies?t=patient'));
    }

    const result = await Promise.allSettled(arr);

    const t2 = Date.now();
    console.log(t2 - t1);
}

main();