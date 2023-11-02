import { Client } from "@notionhq/client";
import { IncomingMessage } from "http";

interface Props {
  req: IncomingMessage;
  notion: Client;
  notionDatabaseId: string;
}

export const note = async ({ req, notion, notionDatabaseId }: Props) => {
  const query = await notion.databases.query({
    database_id: notionDatabaseId,
  });

  const list = query.results.map((row: any) => {
    const rowProp = row.properties;

    const titleCell = rowProp.title;
    const chapterCell = rowProp.chapter;
    const words_enCell = rowProp.words_en;
    const words_koCell = rowProp.words_ko;
    const correctCell = rowProp.correct;
    const wrongCell = rowProp.wrong;

    const isTitle = titleCell.type === "rich_text" && titleCell.rich_text[0];
    const isChapter =
      chapterCell.type === "rich_text" && chapterCell.rich_text[0];
    const isWords_en =
      words_enCell.type === "multi_select" &&
      words_enCell.multi_select.length > 0;
    const isWords_ko =
      words_koCell.type === "multi_select" &&
      words_koCell.multi_select.length > 0;
    const isCorrect =
      correctCell.type === "number" && correctCell.number !== null;
    const isWrong = wrongCell.type === "number" && wrongCell.number !== null;

    if (
      isTitle &&
      isChapter &&
      isWords_en &&
      isWords_ko &&
      isCorrect &&
      isWrong
    ) {
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

  return list;
};
