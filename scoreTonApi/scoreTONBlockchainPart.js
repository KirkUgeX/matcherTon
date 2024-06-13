const TonWeb = require('tonweb');
const nacl = TonWeb.utils.nacl;

const tonweb = new TonWeb();

const keyPair = nacl.sign.keyPair();

async function getInfo(wallet_address) {
    try {
        wallet = tonweb.wallet.create({address: wallet_address });
        const address = await wallet.getAddress();
        const hashPartHex = Array.from(address.hashPart)
                             .map(byte => byte.toString(16).padStart(2, '0'))
                             .join('');
        const wcString = address.wc.toString();
        const ww=wcString.toString()+":"+hashPartHex.toString();
        console.log("account_id",ww)
        const balance = await tonweb.getBalance(address);
        console.log(balance)
        const tons = balance / 1e9;
        console.log(tons)
        //console.log(tons)
        //const history = await tonweb.getTransactions(address);
        //console.log(history);
        await sleep(1000);
        return [tons,ww]
    } catch (error) {
        console.error('Ошибка при получении истории транзакций:', error);
    }
}

async function getNFTs(wallet_address){
    let token = 'AFORT5MZSTSVUAAAAAABDSGS2POTR3CCFKDA4FVSPIZ3SCHHGZ2XCZUQ2L2KW54NHHBHGGA';
    let url = 'https://tonapi.io/v2/accounts/'+wallet_address+'/nfts?limit=1000';
    try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            //console.log(data.nft_items.length)
            return data.nft_items.length
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    } catch (error) {
            console.error('Ошибка при запросе к TON API:', error);

        }
}
async function getScore(wallet_address) {
    const info = await getInfo(wallet_address);
    console.log("Information:",info)
    const nft_count = await getNFTs(wallet_address);
    await sleep(1000);
    let default_url = 'https://tonapi.io/v2/accounts/' + info[1] + '/events?limit=100';
    let url=default_url;
    let token = 'AFORT5MZSTSVUAAAAAABDSGS2POTR3CCFKDA4FVSPIZ3SCHHGZ2XCZUQ2L2KW54NHHBHGGA';
    let volumeTotal = 0;
    let hasNextPage = true;
    let beforeLt = null;
    let age=0;
    let countTransactions=0;
    let team = null;

    while (hasNextPage) {
        if (beforeLt) {
            url = default_url+`&before_lt=${beforeLt}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            await sleep(1000);

            if (data && data.events.length) {
                let lengthData=data.events.length
                countTransactions+=lengthData
                let volumeData = calculateVolume(data.events);
                volumeTotal += volumeData.totalIn;
                team = volumeData.team;
                beforeLt = data.next_from;
                age=data.events[lengthData - 1].timestamp
            } else {

                hasNextPage = false;
            }
        } catch (error) {
            console.error('Ошибка при запросе к TON API:', error);
            hasNextPage = false;
        }
    }
    let balance_ton = info[0];


    let balance_score;


    if (!isNaN(balance_ton)){
        balance_score = balance_to_score(balance_ton);
    } else {
        let count = 0;
        while (isNaN(balance_ton) && count < 10){
            const ton = await tonweb.getBalance(info[1]);
            balance_ton = ton / 1e9;
            console.log("Retry", ton, "Try ", count);
            count++;
            await sleep(1000);
        }
        if (isNaN(balance_ton)){
            balance_ton = 0;
        }
        balance_score = balance_to_score(balance_ton);
        await sleep(1000);
    }
    //console.log("Score balance",balance_score, "balance", info[0])

    const volume_score=volume_to_score(volumeTotal)
    //console.log("Score_volume",volume_score,"volume ", volumeTotal)

    const age_days=Math.ceil((Date.now()/ 1000-age)/60/60/24)
    const age_score=age_or_trans_to_score(age_days)
    //console.log("Age Score", age_score,"Age DAYS ",age_days)

    const transaction_score=age_or_trans_to_score(countTransactions)
    //console.log("Transaction Score", transaction_score,"Transaction number", countTransactions)

    const nft_score=nft_to_score(nft_count)
    //console.log("NFT Score ",nft_score,"NFT Number ",nft_count)

    let additional_score=0;
    let achievements=[];
    //console.log("KOL Team", team)
    if (team !== null){
        achievements.push(`Participant ${team} TONSquad Competition`)
        additional_score+=10;
    }
    additional_info={
    "balance":balance_ton,
    "balanceScore":balance_score,
    "volume":volumeTotal,
    "volumeScore":volume_score,
    "age":age_days,
    "ageScore":age_score,
    "transaction":countTransactions,
    "transactionScore":transaction_score,
    "nft":nft_count,
    "nftScore":nft_score,
    }
    if (balance_ton >= 20000 && balance_ton < 100000) {
        achievements.push("Big Hand");
        additional_score+=300;
    } else if (balance_ton >= 100000) {
        achievements.push("Whale");
        additional_score+=500;}

    if (nft_count >= 5 && nft_count < 20) {
        achievements.push("Silver NFT League");

    } else if (nft_count >= 20 && nft_count < 500) {
        achievements.push("Gold NFT League");
        additional_score+=10;
    } else if (nft_count >= 500) {
        achievements.push("Diamond NFT League");
        additional_score+=100;
    }

    if (age_days >= 200 && nft_count < 360) {
        achievements.push("Doomer of TON");

    } else if (age_days >= 400 && age_days < 700) {
        achievements.push("Boomer of TON");
        additional_score+=10;
    } else if (age_days >= 700) {
        achievements.push("Toomber of TON");
        additional_score+=100;
    }

    if (countTransactions >= 400 && countTransactions < 1000) {
        achievements.push("Gold Activity");
        additional_score+=10;

    } else if (countTransactions >= 1000 ) {
        achievements.push("Diamond Activity");
        additional_score+=100;
    }
    if (volumeTotal>=500 &&  volumeTotal<2000) {
        achievements.push("Gold Trader");

    } else if (volumeTotal>=2000  &&  volumeTotal<5000) {
        achievements.push("Diamond Trader");
        additional_score+=100;
    } else if (volumeTotal>=5000) {
        achievements.push("The God of Trade");
        additional_score+=200;
    }
    const w1=3
    const w2=1.5
    const w3=1.5
    const w4=3
    const w5=1

    const score_res=Math.ceil(w1*balance_score+w2*volume_score+w3*transaction_score+w4*age_score+w5*nft_score)+additional_score
    //console.log("Score",score_res)
    //console.log("Achievement",achievements)
    return {
    "score":score_res,
    "achievement":achievements,
    "additionalInfo":additional_info
    }
}
function calculateVolume(events) {

    let totalIn = 0;
    let totalOut = 0;
    let team = null;
    const teamsByAddress = {
        "0:c810af609db5922030f0cf4dbf8a0df5c4c34a2d7407e5adfb2732f9b886cdd0": "Serp1337 Team",
        "0:7c779a0e38d92b8b1a37fcb43465b2c8e776f16721709dc4b0258a5a2d86cf13": "Trade Party Team",
        "0:a4ad670f54172860d6696e055b4715474263be55cc7b0dc4873091e4279e10b2": "Xremlin Team",
        "0:a2b22f031ca1fd7c2f1ff4ff847f1b98a452ff9654420e6b87728dd0bb8d37ed": "Reflection Team",
        "0:36767cc65273f87a4abd27b831db00b78a0d570277034bc1423aeb68ad80b2a1": "RDeni Team",
        "0:a2020dd98c31c824c45714963772e8c1e287f7c1a9f5ecab463da8122f66bd18": "Pepesso Team",
        "0:0eaf36c316b0bf5ce21862f797c34eedb62c56234db3d568df49e7d07c90080e": "Leshka Team",
        "0:1aa5c3732649d8bc6190656e33542f27a01e86c044568157efffed3124800ac6": "JetStart Team",
        "0:cdf2a5c05df99352af0f8530f119ed7543eb77ca7ac69e6aee09f9bc9070230f": "Hanzo Team",
        "0:d345c12d39bb8949180d4a5ceafe2b58d20d9eb29d1d754083002cee0d56602e": "Finish Team",
    };
    //console.log(events)
    events.forEach(event => {

        event.actions.forEach(action => {
            if (action.type === "JettonSwap" && action.status === "ok") {
                const swapDetails = action.JettonSwap;
                if (swapDetails.ton_in) {
                    totalIn += parseInt(swapDetails.ton_in, 10);
                    //console.log("ton_in ",parseInt(swapDetails.ton_in, 10))
                }
                if (swapDetails.ton_out) {
                    totalOut += parseInt(swapDetails.ton_out, 10);
                    //console.log("ton_out ",parseInt(swapDetails.ton_out, 10))
                }
            }
            if (action.type === "TonTransfer" && action.status === "ok" && action.TonTransfer.comment){
                //console.log("TON TRANS",action.TonTransfer)
                if  (~action.TonTransfer.comment.indexOf("Joining")){
                    if (action.TonTransfer && action.TonTransfer.recipient && action.TonTransfer.recipient.address) {

                      const teamName = teamsByAddress[action.TonTransfer.recipient.address];

                      if (teamName) {
                        team = teamName;
                      }
                    }
                }
            }
        });
    });
    //console.log("volume ",totalIn/ 1e9,totalOut/ 1e9)
    return {
        totalIn: totalIn / 1e9,
        totalOut: totalOut / 1e9,
        team: team
    };
}

function volume_to_score(x) {
    const maxVal = 100;
    const middleVal = 5000;
    const rateOfGrowth1 = 0.0017;
    const rateOfGrowth2 = 0.00001;
    const rateOfGrowth3 = 0.001;
    const a = maxVal * (1 - Math.exp(-rateOfGrowth1 * middleVal));
    const b = maxVal * (1 - Math.exp(-rateOfGrowth2 * middleVal));
    const c = maxVal * (1 - Math.exp(-rateOfGrowth3 * middleVal));
    let y;

    if (x > 500 && x <= 1200) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth3 * x)) + a - c + 14;
    } else if (x > 1200) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth2 * x)) + a - b - 5;
    } else {
        y = maxVal * (1 - Math.exp(-rateOfGrowth1 * x));
    }
    return y;
}
function balance_to_score(x) {
    const maxVal = 100;
    const middleVal =200;
    const rateOfGrowth1 = 0.007;
    const rateOfGrowth2 = 0.001;
    const rateOfGrowth3 = 0.001;
    const a = maxVal * (1 - Math.exp(-rateOfGrowth1 * middleVal));
    const b = maxVal * (1 - Math.exp(-rateOfGrowth2 * middleVal));
    const c = maxVal * (1 - Math.exp(-rateOfGrowth3 * middleVal));
    let y;

    if (x > Math.floor(middleVal / 10) && x <= Math.floor(middleVal / 4)) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth3 * x)) + a - c + Math.floor(5000 / 357);
    } else if (x > 1200) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth2 * x)) + a - b - Math.floor(middleVal / 1000);
    } else {
        y = maxVal * (1 - Math.exp(-rateOfGrowth1 * x));
    }
    return y;
}
function age_or_trans_to_score(x) {
    const maxVal = 100;
    const middleVal =1000;
    const rateOfGrowth1 = 0.005;
    const rateOfGrowth2 = 0.0006;
    const rateOfGrowth3 = 0.0003;
    const a = maxVal * (1 - Math.exp(-rateOfGrowth1 * middleVal));
    const b = maxVal * (1 - Math.exp(-rateOfGrowth2 * middleVal));
    const c = maxVal * (1 - Math.exp(-rateOfGrowth3 * middleVal));
    let y;

    if (x > 360 && x <= 700) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth3 * x)) + a - b;
    } else if (x > 700) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth2 * x)) + a - c;
    } else {
        y = maxVal * (1 - Math.exp(-rateOfGrowth1 * x));
    }
    return y;
}
function nft_to_score(x) {
    const maxVal = 100;
    const middleVal =5;
    const rateOfGrowth1 = 0.145;
    const rateOfGrowth2 = 0.0005;
    const rateOfGrowth3 = 0.005;
    const a = maxVal * (1 - Math.exp(-rateOfGrowth1 * middleVal));
    const b = maxVal * (1 - Math.exp(-rateOfGrowth2 * middleVal));
    const c = maxVal * (1 - Math.exp(-rateOfGrowth3 * middleVal))+a-b;
    let y;

    if (x > 360 && x <= 700) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth3 * x)) + a - b;
    } else if (x > 700) {
        y = maxVal * (1 - Math.exp(-rateOfGrowth2 * x))+c;
    } else {
        y = maxVal * (1 - Math.exp(-rateOfGrowth1 * x));
    }
    if(y>=200){
        return 200;
    }
    return y;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Проверка значений при разных x
//const yAtX0 = volume_to_score(100);
//const yAtX5000 = volume_to_score(400);
//const yAtX10000 = volume_to_score(10000);
//const yAtXMoreThan10000 = volume_to_score(20000);

//console.log('y при x = 100:', yAtX0);
//console.log('y при x = 5000:', yAtX5000);
//console.log('y при x = 10000:', yAtX10000);
//console.log('y при x > 10000:', yAtXMoreThan10000);
module.exports = { getScore };