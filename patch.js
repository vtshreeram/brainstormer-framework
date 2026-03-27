const fs = require('fs');
const file = 'src/components/ui/PRDSectionView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/type InlineAction = 'improve' \| 'regenerate' \| null;/, `type InlineAction = 'improve_options' | 'improve_preview' | 'regenerate' | null;`);

const optionsView = `
// ─── Improve Options View ──────────────────────────────────────────────────

function ImproveOptionsView({
  onGenerate,
  onCancel,
}: {
  onGenerate: (instruction: string | null) => void;
  onCancel: () => void;
}) {
  const [instruction, setInstruction] = useState('');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4 animate-in slide-in-from-top-1 fade-in duration-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ImproveIcon />
          </div>
          <span className="text-sm font-semibold text-gray-700">Improve this section</span>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Quick Improve */}
        <div>
          <button
            onClick={() => onGenerate(null)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Improve Automatically
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            AI will automatically enhance clarity, structure, and readability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OR CHOOSE</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Guided Improve */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onGenerate('Improve clarity')} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200">Improve clarity</button>
          <button onClick={() => onGenerate('Make it concise')} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200">Make it concise</button>
          <button onClick={() => onGenerate('Add more details')} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200">Add more details</button>
          <button onClick={() => onGenerate('Make it more professional')} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200">Make it professional</button>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="What would you like to improve?"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            onKeyDown={(e) => e.key === 'Enter' && instruction.trim() && onGenerate(instruction.trim())}
          />
          <button
            onClick={() => onGenerate(instruction.trim())}
            disabled={!instruction.trim()}
            className="px-4 py-2.5 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Improve Preview View ──────────────────────────────────────────────────

interface ImprovePreviewViewProps {
  originalContent: string;
  improvedContent: string | null;
  isLoading: boolean;
  onAccept: (content: string) => void;
  onRegenerate: () => void;
  onCancel: () => void;
}

function ImprovePreviewView({
  originalContent,
  improvedContent,
  isLoading,
  onAccept,
  onRegenerate,
  onCancel,
}: ImprovePreviewViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Update editedContent when improvedContent changes
  React.useEffect(() => {
    if (improvedContent) {
      setEditedContent(improvedContent);
      setIsEditing(false);
    }
  }, [improvedContent]);

  if (isLoading) {
    return <LoadingOverlay message="Generating improved version…" />;
  }

  if (!improvedContent) return null;

  return (
    <div className="mt-3 space-y-4 animate-in slide-in-from-top-1 fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original version */}
        <div className="rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-sm bg-white">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Original
              </span>
            </div>
          </div>
          <div className="p-5 opacity-75 overflow-y-auto max-h-[400px] flex-1 prose-sm prose-gray">
            <ReactMarkdown>{originalContent}</ReactMarkdown>
          </div>
        </div>

        {/* Improved version */}
        <div className="rounded-lg border border-emerald-200 overflow-hidden flex flex-col shadow-md bg-white relative">
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Improved Version
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded text-emerald-600 bg-emerald-100 border border-emerald-200 font-bold ml-1">
                ✨ AI Generated
              </span>
            </div>
            {isEditing && (
               <span className="text-[10px] px-2 py-0.5 rounded text-gray-500 bg-white border border-gray-200 font-bold shadow-sm">Editing manually</span>
            )}
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px] flex-1 flex flex-col relative">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full flex-1 p-5 text-sm font-mono text-gray-800 focus:outline-none resize-none min-h-[300px] bg-emerald-50/30"
                spellCheck={false}
              />
            ) : (
              <div className="p-5 bg-emerald-50/10 h-full prose-sm prose-emerald">
                 <ReactMarkdown>{editedContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 bg-white shadow-sm"
          >
            {isEditing ? 'Done Editing' : 'Edit Manually'}
          </button>

          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 border border-emerald-200 bg-emerald-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>

          <button
            onClick={() => onAccept(editedContent)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept Changes
          </button>
        </div>
      </div>
    </div>
  );
}
`;

// Replace ImproveView component
code = code.replace(/function ImproveView[\s\S]*?(?=\/\/ ─── Regenerate view)/, optionsView);

// Replace handleImprove with handleImproveOptions and handleGenerateImprove
const replaceStr = `const lastInstructionRef = useRef<string | null>(null);

  const handleImproveOptions = useCallback(() => {
    setAction('improve_options');
    setImprovedContent(null);
  }, []);

  const handleGenerateImprove = useCallback(async (instruction: string | null) => {
    setAction('improve_preview');
    setIsLoading(true);
    setImprovedContent(null);
    lastInstructionRef.current = instruction;

    try {
      const res = await fetch('/api/section-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_heading: heading,
          section_content: content,
          instruction: instruction
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || \`Request failed: \${res.status}\`);
      }

      const data = await res.json();
      setImprovedContent(data.improved_content ?? null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[PRDSectionView] improve error:', message);
      onToast('Failed to improve section. Please try again.', 'error');
      setAction('improve_options');
    } finally {
      setIsLoading(false);
    }
  }, [heading, content, onToast]);`;

code = code.replace(/const handleImprove = useCallback\(async \(\) => \{[\s\S]*?\}, \[heading, content, onToast\]\);/, replaceStr);

// Change onImprove={handleImprove} to onImprove={handleImproveOptions}
code = code.replace(/onImprove=\{handleImprove\}/g, 'onImprove={handleImproveOptions}');

// Change handleReplaceImproved signature
code = code.replace(/const handleReplaceImproved = useCallback\(\(\) => \{/, 'const handleReplaceImproved = useCallback((editedContent: string) => {');
code = code.replace(/onReplace\(sectionId, improvedContent\);/, 'onReplace(sectionId, editedContent);');
code = code.replace(/\[improvedContent, sectionId, onReplace, onToast\]/, '[sectionId, onReplace, onToast]');

// Action label bar active check
code = code.replace(/\{action !== null && \(/, '{action !== null && action !== "improve_options" && (');
code = code.replace(/action === 'improve'/g, 'action === "improve_preview"');

// Action classes logic
code = code.replace(/action === 'improve'/, 'action?.startsWith("improve")');
code = code.replace(/action !== null\s*\?\s*action === 'improve'/g, 'action !== null ? action.startsWith("improve")');

// Replace {action === 'improve' && ... } with {action === 'improve_options' ... } and {action === 'improve_preview' ... }
const renderContentReplace = `{action === null && <ReactMarkdown>{content}</ReactMarkdown>}

        {action === 'improve_options' && (
          <>
            <ReactMarkdown>{content}</ReactMarkdown>
            <ImproveOptionsView
              onGenerate={handleGenerateImprove}
              onCancel={handleCancel}
            />
          </>
        )}

        {action === 'improve_preview' && (
          <ImprovePreviewView
            originalContent={content}
            improvedContent={improvedContent}
            isLoading={isLoading}
            onAccept={handleReplaceImproved}
            onRegenerate={() => handleGenerateImprove(lastInstructionRef.current)}
            onCancel={handleCancel}
          />
        )}`;

code = code.replace(/\{action === null && <ReactMarkdown>\{content\}<\/ReactMarkdown>\}(?:.|\n)*?(?=\{\/\* ── Regenerate view \*\/\})/, renderContentReplace + '\n\n        ');

fs.writeFileSync(file, code);
console.log('Patched PRDSectionView');
