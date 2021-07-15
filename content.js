const targetNode = document.getElementById("wallet-item");

const observerCallback = async (mutationsList) => {
    for (const mutation of mutationsList) {
        let currentBalance;
        if (mutation.type === "childList" && mutation.addedNodes) {
            currentBalance = mutation.addedNodes[0].data;
        } else if (mutation.type === "characterData" && mutation.target) {
            currentBalance = mutation.target.data;
        }
        if (currentBalance) {
            if (!currentBalance.includes("$")) {
                let toCurrency;
                let amount;
                if (currentBalance.startsWith("£")) {
                    toCurrency = "GBP";
                    amount = Number(currentBalance.replace("£", ""));
                }
                if (toCurrency) {
                    const userToken = localStorage.getItem("token");
                    if (!userToken) return; // NOT LOGGED IN

                    let result = await fetch(`https://edge.gnog.prod.gloot.com/gnog-nest/currency/conversion/USD?amount=${amount.toString()}&currency=${toCurrency}`,
                        {
                            method: "get",
                            headers: {
                                "Authorization": `Bearer ${userToken}`,
                                "Host": "edge.gnog.prod.gloot.com"
                            }
                        }
                    );
                    result = await result.json();
                    document.getElementById("wallet-item").innerHTML = `${currentBalance} ($${result.amount})`;
                }
            }
        }
    }
};

const observer = new MutationObserver(observerCallback);
observer.observe(targetNode, {characterData:true, attributes:false, childList:true, subtree:true});