const SourceBox = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sources</h3>
      <div className="space-y-1.5">
        {sources.map((source, index) => (
          <div key={index} className="text-xs text-slate-600">
            {source.file || source.filename || 'SOP'} | Page: {source.page || 'N/A'} | Section: {source.section || 'N/A'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceBox;
