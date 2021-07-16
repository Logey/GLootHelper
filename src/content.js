const targetNode = document.getElementById("wallet-item");

let lastCurrencyConversion = {};

const observerCallback = async (mutationsList) => {
    for (const mutation of mutationsList) {
        let currentBalance;
        if (mutation.type === "childList" && mutation.addedNodes) {
            currentBalance = mutation.addedNodes[0].data;
        } else if (mutation.type === "characterData" && mutation.target) {
            currentBalance = mutation.target.data;
        }
        if (!currentBalance || currentBalance.includes("$")) return; // couldnt get balance, or balance already in usd

        let toCurrency;
        let amount;
        if (currentBalance.startsWith("£")) {
            toCurrency = "GBP";
            amount = Number(currentBalance.replace("£", ""));
        } else if (currentBalance.endsWith("kr")) {
            toCurrency = "SEK";
            amount = Number(currentBalance.replace("kr", ""));
        } else if (currentBalance.startsWith("€")) {
            toCurrency = "EUR";
            amount = Number(currentBalance.replace("€", ""));
        }

        if (!toCurrency) return; // incompatible currency?

        let result;
        if (amount === lastCurrencyConversion.amount && toCurrency === lastCurrencyConversion.toCurrency) {
            result = {amount: lastCurrencyConversion.USD};
        } else {
            const userToken = localStorage.getItem("token");
            if (!userToken) return; // NOT LOGGED IN

            result = await fetch(`https://edge.gnog.prod.gloot.com/gnog-nest/currency/conversion/USD?amount=${amount.toString()}&currency=${toCurrency}`,
                {
                    method: "get",
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                        "Host": "edge.gnog.prod.gloot.com"
                    }
                }
            );
            result = await result.json();

            // save for next conversion
            lastCurrencyConversion = {amount, toCurrency, USD:result.amount};
        }
        document.getElementById("wallet-item").innerHTML = `${currentBalance} ($${result.amount})`;
    }
};

const observer = new MutationObserver(observerCallback);
observer.observe(targetNode, {characterData:true, attributes:false, childList:true, subtree:true});