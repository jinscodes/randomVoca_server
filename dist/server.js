"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@notionhq/client");
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const login_1 = require("./login");
const note_1 = require("./note");
const notionDatabaseLogin = process.env.NOTION_DATABASE_LOGIN;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;
if (!notionDatabaseId || !notionSecret || !notionDatabaseLogin) {
    throw Error("Must define NOTION_SECRET and NOTION_DATABASE_ID in env");
}
const notion = new client_1.Client({
    auth: notionSecret,
});
const host = "localhost";
const port = 8000;
const server = http_1.default.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader("Access-Control-Allow-Origin", "*");
    switch (req.url) {
        case "/":
            const list = yield (0, note_1.note)({ req, notion, notionDatabaseId });
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify(list));
            break;
        case "/login":
            const datas = yield (0, login_1.login)({ res, req, notion, notionDatabaseLogin });
            console.log("isLogin: ", datas);
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify(datas));
            break;
        default:
            res.setHeader("Content-Type", "application/json");
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Resource not found" }));
    }
}));
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
