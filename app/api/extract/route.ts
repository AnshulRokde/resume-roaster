import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

function extractTextFromParsedPDF(data: ReturnType<typeof JSON.parse>): string {
  return (data.Pages as Array<{ Texts: Array<{ R: Array<{ T: string }> }> }>)
    .flatMap((page) =>
      page.Texts.map((textItem) =>
        textItem.R.map((run) => {
          try {
            return decodeURIComponent(run.T);
          } catch {
            return run.T;
          }
        }).join("")
      )
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "This endpoint only handles PDF files." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await new Promise<string>((resolve, reject) => {
      const parser = new PDFParser();
      parser.on("pdfParser_dataReady", (data) => {
        resolve(extractTextFromParsedPDF(data));
      });
      parser.on("pdfParser_dataError", (err) => {
        reject(new Error(String(err)));
      });
      parser.parseBuffer(buffer);
    });

    if (text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from this PDF. Try a text-based PDF rather than a scanned image.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to parse PDF: ${message}` },
      { status: 500 }
    );
  }
}
