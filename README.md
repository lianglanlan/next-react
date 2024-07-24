# 执行步骤
## 切换node版本
```
nvm use
```

## 下载pnpm
```
npm install -g pnpm
```

## 创建目录

## 这一步
查看https://nextjs.org/learn/dashboard-app/setting-up-your-database

```
pnpm i @vercel/postgres
```
安装vercel/postgres

## 写入数据
写入数据的代码在`app/seed/route.ts`文件里，打开 http://localhost:3000/seed 网址进行写入操作。