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
// The dotenv library will read from your .env file into these values on `process.env`
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;
// Will provide an error to users who forget to create the .env file
// with their Notion data in it
if (!notionDatabaseId || !notionSecret) {
    throw Error("Must define NOTION_SECRET and NOTION_DATABASE_ID in env");
}
// Initializing the Notion client with your secret
const notion = new client_1.Client({
    auth: notionSecret,
});
const host = "localhost";
const port = 8000;
// Require an async function here to support await with the DB query
const server = http_1.default.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader("Access-Control-Allow-Origin", "*");
    switch (req.url) {
        case "/":
            // Query the database and wait for the result
            const query = yield notion.databases.query({
                database_id: notionDatabaseId,
            });
            // console.log("query: ", query);
            query.results.map((row) => {
                // console.log(row.properties);
                // console.log("title: ", row.properties.title);
                if (row.properties.title.type === "rich_text" &&
                    row.properties.title.rich_text[0]) {
                    console.log("title rich_text: ", row.properties.title.rich_text[0]);
                }
            });
            // We map over the complex shape of the results and return a nice clean array of
            // objects in the shape of our `ThingToLearn` interface
            // const list: ThingToLearn[] = query.results.map((row) => {
            //   // console.log("row: ", row);
            //   // row represents a row in our database and the name of the column is the
            //   // way to reference the data in that column
            //   const titleCell = row.properties.title;
            //   const chapterCell = row.properties.chapter;
            //   const words_enCell = row.properties.words_en;
            //   const words_koCell = row.properties.words_ko;
            //   const correctCell = row.properties.correct;
            //   const wrongCell = row.properties.wrong;
            //   // Depending on the column "type" we selected in Notion there will be different
            //   // data available to us (URL vs Date vs text for example) so in order for Typescript
            //   // to safely infer we have to check the `type` value.  We had one text and one url column.
            //   const isTitle = titleCell.type === "rich_text";
            //   const isChapter = chapterCell.type === "rich_text";
            //   const isWords_en = words_enCell.type === "rich_text";
            //   const isWords_ko = words_koCell.type === "rich_text";
            //   const isCorrect = correctCell.type === "number";
            //   const isWrong = wrongCell.type === "number";
            //   // Verify the types are correct
            //   if (
            //     isTitle &&
            //     isChapter &&
            //     isWords_en &&
            //     isWords_ko &&
            //     isCorrect &&
            //     isWrong
            //   ) {
            //     // Pull the string values of the cells off the column data
            //     // const url = urlCell.url ?? "";
            //     // console.log("titleCell: ", titleCell);
            //     // console.log("title rich_text: ", titleCell.rich_text);
            //     const title = titleCell.rich_text?.[0].plain_text;
            //     const chapter = chapterCell.rich_text?.[0].plain_text;
            //     const words_en = words_enCell.rich_text?.[0].plain_text;
            //     const words_ko = words_koCell.rich_text?.[0].plain_text;
            //     const correct = correctCell.number;
            //     const wrong = wrongCell.number;
            //     // console.log("title: ", title);
            //     // console.log("correct: ", correct);
            //     // console.log("wrong: ", wrong);
            //     // Return it in our `ThingToLearn` shape
            //     return {
            //       title,
            //       chapter,
            //       words_en,
            //       words_ko,
            //       // correct,
            //       // wrong,
            //     };
            //   }
            //   // If a row is found that does not match the rules we checked it will still return in the
            //   // the expected shape but with a NOT_FOUND label
            //   return {
            //     title: "NOT_FOUND",
            //     chapter: "NOT_FOUND",
            //     words_en: "NOT_FOUND",
            //     words_ko: "NOT_FOUND",
            //     correct: 0,
            //     wrong: 0,
            //   };
            // });
            let list = {
                title: "NOT_FOUND",
                chapter: "NOT_FOUND",
                words_en: "NOT_FOUND",
                words_ko: "NOT_FOUND",
                correct: 0,
                wrong: 0,
            };
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
