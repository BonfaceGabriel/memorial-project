import { useState, useEffect, useRef, useCallback, memo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import useAuth from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Eulogy.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const sections = {
  eulogy: "Eulogy for My Father",
  earlyLife: "Early Life",
  education: "Education",
  marriage: "Marriage",
  career: "Career",
  christianLife: "Christian Life",
  community: "Contribution to the community",
  illness: "Illness Journey",
} as const;

type SectionKey = keyof typeof sections;

type ContentMap = Record<SectionKey, string>;

/** ---------------- SectionEditor ---------------- */
interface SectionEditorProps {
  sectionKey: SectionKey;
  title: string;
  isFirst: boolean;
  initialValue: string;
  onChange: (key: SectionKey, value: string) => void;
}

const SectionEditor = memo(
  ({
    sectionKey,
    title,
    isFirst,
    initialValue,
    onChange,
  }: SectionEditorProps) => {
    const quillRef = useRef<ReactQuill | null>(null);

    // Because `ReactQuill` is uncontrolled (defaultValue) it will NOT rerender after first mount.
    return (
      <div>
        <h2 className="eulogy-subheading">{title}</h2>
        {isFirst && (
          <p className="text-lg text-gray-300 italic mb-4 text-center">
            Beldina
          </p>
        )}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          defaultValue={initialValue}
          onChange={(html) => onChange(sectionKey, html)}
          className="w-full h-full bg-black/60 border border-gold/30 rounded-lg text-gray-200 p-4 focus:border-gold focus:outline-none transition-colors"
        />
      </div>
    );
  }
);
SectionEditor.displayName = "SectionEditor";

/** ---------------- Main Component ---------------- */
const Eulogy = () => {
  const { isAdmin } = useAuth();

  /** Saved (last‐persisted) content */
  const [content, setContent] = useState<ContentMap>(() => {
    // while loading, provision placeholders so the map is always defined
    const placeholders = {} as ContentMap;
    (Object.keys(sections) as SectionKey[]).forEach((k) => {
      placeholders[k] = "<p>...</p>";
    });
    return placeholders;
  });

  /** Live edits buffer that will *not* cause React re‑renders on each keystroke */
  const unsavedRef = useRef<Partial<ContentMap>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- helpers ---------- */
  const parseContent = useCallback((html: string): ContentMap => {
    const newContent = {} as ContentMap;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    (Object.keys(sections) as SectionKey[]).forEach((key) => {
      const element = doc.getElementById(key);
      newContent[key] = element ? element.innerHTML : "<p>...</p>";
    });
    return newContent;
  }, []);

  const buildHtml = (data: ContentMap) => {
    return (Object.entries(data) as [SectionKey, string][])
      .map(([key, value]) => {
        const title = sections[key];
        let html = `<h2 class="eulogy-subheading">${title}</h2>`;
        if (key === "eulogy")
          html += `<p style="text-align: center;"><i>Beldina</i></p><br/>`;
        html += `<div id="${key}">${value}</div>`;
        return html;
      })
      .join("<br/>");
  };

  /* ---------- data fetch ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/eulogy`);
        if (!res.ok) throw new Error("Failed to fetch eulogy content");
        const data = await res.json();
        if (data?.content) setContent(parseContent(data.content));
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
    })();
  }, [parseContent]);

  /* ---------- change tracking ---------- */
  const handleSectionChange = useCallback((key: SectionKey, value: string) => {
    unsavedRef.current[key] = value;
  }, []);

  /* ---------- save ---------- */
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to edit the eulogy.");
        return;
      }

      // Merge saved + unsaved → one payload
      const merged: ContentMap = {
        ...content,
        ...unsavedRef.current,
      } as ContentMap;

      const response = await fetch(`${API_BASE_URL}/eulogy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: buildHtml(merged) }),
      });

      if (!response.ok) throw new Error("Failed to save eulogy content");

      // Persist new state & reset draft buffer
      setContent(merged);
      unsavedRef.current = {};
      setIsEditing(false);
      toast.success("Eulogy content updated successfully!");
    } catch (err: unknown) {
      toast.error(
        `Failed to save eulogy content: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  /* ---------- render ---------- */
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  const MainContent = () => (
    <div className="bg-purple-dark/50 backdrop-blur-sm border border-gold/30 rounded-lg p-6 md:p-10 shadow-2xl">
      <h1 className="text-3xl font-tt-chocolates-demibold text-gold mb-6 text-center">
        HIS STORY
      </h1>

      {isAdmin && (
        <div className="mb-6 flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  unsavedRef.current = {}; /* discard */
                  setIsEditing(false);
                }}
                variant="outline"
                className="text-white border-gray-500 hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-purple-medium hover:bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Edit Story
            </Button>
          )}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-8">
          {(Object.entries(sections) as [SectionKey, string][])?.map(
            ([key, title]) => (
              <SectionEditor
                key={key}
                sectionKey={key}
                title={title}
                isFirst={key === "eulogy"}
                initialValue={content[key]}
                onChange={handleSectionChange}
              />
            )
          )}
        </div>
      ) : (
        <div
          className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: buildHtml(content) }}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="fixed inset-0 scroll-bg opacity-30 z-0"></div>
      <Navigation />
      <div className="relative z-10">
        <main className="max-w-4xl mx-auto px-4 py-12 pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4 gold-shimmer">
              A LIFE WELL LIVED
            </h1>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 italic">
              THE STORY OF BERNARD "BK" KASEMA
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-purple-dark/50 backdrop-blur-sm border border-gold/30 rounded-lg p-4 text-center shadow-2xl">
                  <img
                    src="/lovable-uploads/Eulogy_Photo.jpeg"
                    alt="Bernard Muasya Kasema"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <h3 className="text-xl font-bold text-gold">
                    BERNARD KASEMA <br>
                    </br>"BK"
                  </h3>
                </div>
              </div>
            </aside>

            <article className="lg:col-span-2">
              <MainContent />
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Eulogy;
