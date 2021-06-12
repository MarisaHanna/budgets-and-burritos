let db;

const request = indexedDB.open("my_budget", 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("pending_transaction", { autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.online) {
        postData();
    }
};

request.onerror = (event) => {
    console.log(`OOOOPS! ${event.target.errorCode}`);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending_transaction"], "readwrite");

    const store = transaction.objectStore("pending_transaction");

    store.add(record);
}

function postData() {
    const transaction = db.transaction(["pending_transaction"], "readwrite");
    const store = transaction.objectStore("pending_transaction");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(()=>{
                const transaction = db.transaction(["pending_transaction"], "readwrite");
                const store = transaction.objectStore("pending_transaction");

                store.clear();

                alert('All saved transactions has been submitted!');
            });
        }
    };
}

window.addEventListener("online", postData);