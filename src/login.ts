import { Client } from "@notionhq/client";
import { IncomingMessage } from "http";

interface Props {
  req: IncomingMessage;
  notion: Client;
  notionDatabaseLogin: string;
}

export const login = async ({ req, notion, notionDatabaseLogin }: Props) => {
  const query = await notion.databases.query({
    database_id: notionDatabaseLogin,
  });

  // id & pw from DB
  const fromDB = query.results.map((row) => {
    const rowProp = row.properties;

    const idCell = rowProp.id;
    const pwCell = rowProp.pw;

    const isId = idCell.type === "rich_text" && idCell.rich_text[0];
    const isPw = pwCell.type === "rich_text" && pwCell.rich_text[0];

    if (isId && isPw) {
      const id = idCell.rich_text[0].plain_text;
      const pw = pwCell.rich_text[0].plain_text;

      return { id, pw };
    }
  });

  if (req.method === "POST") {
    // bring id & pw
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    // id & pw from CLIENT
    req.on("end", () => {
      const bodyJson = JSON.parse(body);
      // console.log("from DB: ", fromDB);
      // console.log("to json: ", bodyJson);

      const matchedId = fromDB.filter((data) => data?.id === bodyJson.id);
      const matchedPw = matchedId.filter((data) => {
        return data?.pw === bodyJson.pw;
      });
      console.log("matchedPw: ", matchedPw.length === 1 && true);

      return bodyJson;
    });
  }
};
