# 使用 Node.js 的官方鏡像作為基礎
FROM node:18

# 創建工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製其餘的應用程式代碼
COPY . .

# 暴露應用程式埠口
EXPOSE 3000

# 啟動應用程式
CMD [ "node", "index.js" ]
