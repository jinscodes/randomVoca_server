import { Client } from "@notionhq/client";
import { IncomingMessage, ServerResponse } from "http";

interface Props {
  res: ServerResponse<IncomingMessage>;
  req: IncomingMessage;
  notion: Client;
  notionDatabaseLogin: string;
}

export const login = async ({
  res,
  req,
  notion,
  notionDatabaseLogin,
}: Props) => {
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

    return {
      id: "NOT_FOUND",
      pw: "NOT_FOUND",
    };
  });

  return fromDB;
};
