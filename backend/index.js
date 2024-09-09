const WebSocket = require("ws");

// Binance WebSocket API URL for order book
const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/ethbtc@depth10";

// Create a WebSocket connection
const binanceWs = new WebSocket(BINANCE_WS_URL);
const priceInterval = 0.00001;
const scaleFactor = 100000;

// Create WebSocket server for the front-end
const wss = new WebSocket.Server({ port: 8083 });

let orderBook = null; // Store the current orderBook

// Handle incoming WebSocket connections from the front-end
wss.on("connection", (clientWs) => {
  console.log("Client connected");

  // When a client connects, send the current order book if available
  if (orderBook) {
    clientWs.send(JSON.stringify(orderBook));
  }

  // Handle client disconnection
  clientWs.on("close", () => {
    console.log("Client disconnected");
  });
});

// Handle connection to Binance WebSocket
binanceWs.on("open", () => {
  console.log("Connected to Binance WebSocket");
});

// Handle incoming messages from Binance WebSocket
binanceWs.on("message", (data) => {
  let tmpOrderBook = JSON.parse(data);

  // Randomize the order book
  orderBook = randomisze(tmpOrderBook);

  // Broadcast the updated order book to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(orderBook));
    }
  });
});

// Handle WebSocket errors
binanceWs.on("error", (error) => {
  console.error("WebSocket error:", error);
});

// Graceful shutdown
process.on("SIGINT", () => {
  binanceWs.close();
  console.log("Shutting down...");
  process.exit();
});

function randomisze(tmpOrderBook) {
  let bidPrice = Number(tmpOrderBook.bids[0][0]);
  let askPrice = Number(tmpOrderBook.asks[0][0]);
  // 把第一個元素從字串轉數字
  tmpOrderBook.bids[0][0] = bidPrice;
  tmpOrderBook.asks[0][0] = askPrice;
  //下面做加減的時候要處理溢位
  for (i = 1; i < tmpOrderBook.bids.length; i++) {
    bidPrice =
      (bidPrice * scaleFactor -
        (Math.floor(Math.random() * 3) + 1) * priceInterval * scaleFactor) /
      scaleFactor;
    askPrice =
      (askPrice * scaleFactor +
        (Math.floor(Math.random() * 3) + 1) * priceInterval * scaleFactor) /
      scaleFactor;
    tmpOrderBook.bids[i][0] = bidPrice;
    tmpOrderBook.asks[i][0] = askPrice;
  }
  generatePriceBid(tmpOrderBook.bids, 5);
  generatePriceAsk(tmpOrderBook.asks, 150);

  return tmpOrderBook;
}
function generatePriceAsk(input, limit) {
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    let remaining = limit * scaleFactor - sum; // 確保總和不超過limit
    let randomNum = Math.floor(
      (Math.random() * remaining) / (input.length - i)
    ); // 根據剩餘的總和分配隨機數 這邊除以(input.length - i)會看起來比較平均 這段看需求不加會偏隨機加了會偏平均
    input[i][1] = randomNum / scaleFactor;
    sum += randomNum;
  }

  return;
}
//這個地方切換成base coin的視角
function generatePriceBid(input, limit) {
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    let remaining = limit * scaleFactor - sum; // 確保總和不超過limit
    let randomNum = Math.floor(
      (Math.random() * remaining) / (input.length - i)
    ); // 根據剩餘的總和分配隨機數 這邊除以(input.length - i)會看起來比較平均 這段看需求不加會偏隨機加了會偏平均
    input[i][1] = randomNum / scaleFactor / input[i][0];
    sum += randomNum;
  }

  return;
}

//可以把bids丟進來這邊檢查是否符合需求
function checkSum(input) {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input[i][0] * input[i][1];
  }
  console.log("checkSum", sum);
}
