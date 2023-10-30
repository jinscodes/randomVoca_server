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
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;
if (!notionDatabaseId || !notionSecret) {
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
            const query = yield notion.databases.query({
                database_id: notionDatabaseId,
            });
            const list = query.results.map((row) => {
                const rowProp = row.properties;
                const titleCell = rowProp.title;
                const chapterCell = rowProp.chapter;
                const words_enCell = rowProp.words_en;
                const words_koCell = rowProp.words_ko;
                const correctCell = rowProp.correct;
                const wrongCell = rowProp.wrong;
                const isTitle = titleCell.type === "rich_text" && titleCell.rich_text[0];
                const isChapter = chapterCell.type === "rich_text" && chapterCell.rich_text[0];
                const isWords_en = words_enCell.type === "multi_select" &&
                    words_enCell.multi_select.length > 0;
                const isWords_ko = words_koCell.type === "multi_select" &&
                    words_koCell.multi_select.length > 0;
                const isCorrect = correctCell.type === "number" && correctCell.number !== null;
                const isWrong = wrongCell.type === "number" && wrongCell.number !== null;
                if (isTitle &&
                    isChapter &&
                    isWords_en &&
                    isWords_ko &&
                    isCorrect &&
                    isWrong) {
                    const title = titleCell.rich_text[0].plain_text;
                    const chapter = chapterCell.rich_text[0].plain_text;
                    const words_en = words_enCell.multi_select;
                    const words_ko = words_koCell.multi_select;
                    const correct = correctCell.number;
                    const wrong = wrongCell.number;
                    return { title, chapter, words_en, words_ko, correct, wrong };
                }
                return {
                    title: "NOT_FOUND",
                    chapter: "NOT_FOUND",
                    words_en: "NOT_FOUND",
                    words_ko: "NOT_FOUND",
                    correct: 0,
                    wrong: 0,
                };
            });
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify(list));
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
