import { Client } from "@notionhq/client";
import "dotenv/config";
import http from "http";
import { jwt } from "./jwt";
import { login } from "./login";
import { note } from "./note";

const notionDatabaseLogin = process.env.NOTION_DATABASE_LOGIN;
export const notionDatabaseId = process.env.NOTION_DATABASE_ID;
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
      const isMatch = await login({ res, req, notion, notionDatabaseLogin });

      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", async () => {
          const bodyJson = JSON.parse(body);
          const matchedId = isMatch.filter((data) => data?.id === bodyJson.id);
          const matchedPw = matchedId.filter((data) => {
            return data?.pw === bodyJson.pw;
          });

          if (matchedPw.length === 1) {
            const jwtToken = jwt({ header: bodyJson, payload: bodyJson });
            const token = { token: jwtToken, status: 200 };

            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify(token));
          } else {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(401);
            res.end(JSON.stringify({ status: 401 }));
          }
        });
      }
      break;

    case "/regist":
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", async () => {
          const bodyJson = JSON.parse(body);
          console.log("76: ", bodyJson);

          await notion.pages.create({
            parent: {
              database_id: notionDatabaseId,
            },
            properties: {
              id: {
                rich_text: [
                  {
                    text: {
                      content: "id test2",
                    },
                  },
                ],
              },
              title: {
                rich_text: [
                  {
                    text: {
                      content: "title test4",
                    },
                  },
                ],
              },
              chapter: {
                rich_text: [
                  {
                    text: {
                      content: "chapter test3",
                    },
                  },
                ],
              },
              words_en: {
                multi_select: [
                  {
                    name: "en test5",
                  },
                  {
                    name: "en test6",
                  },
                ],
              },
              words_ko: {
                multi_select: [
                  {
                    name: "ko test7",
                  },
                  {
                    name: "ko test8",
                  },
                ],
              },
              correct: {
                number: 0,
              },
              wrong: {
                number: 0,
              },
            },
          });
        });
      }

    default:
      res.setHeader("Content-Type", "application/json");
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
