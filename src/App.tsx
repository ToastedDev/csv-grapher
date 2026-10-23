import {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
  useCallback,
} from "react";
import { FileText, Upload, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chart } from "./components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "./components/mode-toggle";
import { cn } from "./lib/utils";

type FileData = {
  fileName: string;
  content: string[][];
  type: "csv" | "tsv";
};

// A date-only value like "2026-10-23" has no colon, so any time-like
// `HH:mm` segment means the dataset carries a time of day.
const hasTimeComponent = (value: string) => /\d{1,2}:\d{2}/.test(value);

export default function FileUploader() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHeader, setCurrentHeader] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);

    // Check if file is CSV or TSV
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv" && fileExtension !== "tsv") {
      setError("Please upload a CSV or TSV file");
      return;
    }

    const fileType = fileExtension as "csv" | "tsv";
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const delimiter = fileType === "csv" ? "," : "\t";
        const rows = content
          .split("\n")
          .map((row) => row.split(delimiter).map((cell) => cell.trim()));

        setCurrentHeader(rows[0][1]);
        setFileData({
          fileName: file.name,
          content: rows,
          type: fileType,
        });
      } catch {
        setError("Error parsing file. Please check the file format.");
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const resetFile = useCallback(() => {
    setFileData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [fileInputRef]);

  const includeTime = Boolean(
    fileData?.content
      .slice(1)
      .some((row) => row[0] && hasTimeComponent(row[0]))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>CSV/TSV Grapher</CardTitle>
            <CardDescription>
              View a CSV or TSV file as a line graph.
            </CardDescription>
          </div>
          <ModeToggle />
        </CardHeader>
        <CardContent>
          {!fileData ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div
                  className={`p-4 rounded-full ${
                    isDragging ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <Upload
                    className={`h-8 w-8 ${
                      isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isDragging
                      ? "Drop your file here"
                      : "Drag and drop your file here"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click anywhere in this area to select a file
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv,.tsv"
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-transparent dark:bg-input/30 rounded-lg border">
                <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileData.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fileData.type.toUpperCase()} • {fileData.content.length}{" "}
                    rows
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:!bg-foreground/10"
                  onClick={resetFile}
                  title="Upload another file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Select value={currentHeader} onValueChange={setCurrentHeader}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Header" />
                </SelectTrigger>
                <SelectContent>
                  {fileData.content[0].slice(1).map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Chart
                includeTime={includeTime}
                series={[
                  {
                    name: currentHeader,
                    data: fileData.content
                      .slice(1)
                      .map((row) => [
                        new Date(row[0]).getTime(),
                        parseInt(
                          row[fileData.content[0].indexOf(currentHeader)]
                        ),
                      ]),
                  },
                ]}
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
        {/* CardFooter removed */}
      </Card>
    </div>
  );
}
