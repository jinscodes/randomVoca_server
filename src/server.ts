import { Client } from "@notionhq/client";
import "dotenv/config";
import http from "http";
import { note } from "./note";

interface ThingToLearn {
  title: string;
  chapter: string;
  words_en: string[];
  words_ko: string[];
  correct: number;
  wrong: number;
}

const notionDatabaseLogin = process.env.NOTION_DATABASE_LOGIN;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;

if (!notionDatabaseId || !notionSecret || !notionDatabaseLogin) {
  throw Error("Must define NOTION_SECRET and NOTION_DATABASE_ID in env");
}

const notion = new Client({
  auth: notionSecret,
});

const host = "localhost";
const port = 8000;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/":
      const list = await note({ req, notion, notionDatabaseId });

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(list));
      break;

    case "/login":
      // console.log("/login url req: ", req.url);

      const query2 = await notion.databases.query({
        database_id: notionDatabaseLogin,
      });

      const list2 = query2.results.map((row) => {
        const rowProp = row.properties;

        console.log(rowProp);
      });

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(list2));
      break;

    default:
      res.setHeader("Content-Type", "application/json");
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
