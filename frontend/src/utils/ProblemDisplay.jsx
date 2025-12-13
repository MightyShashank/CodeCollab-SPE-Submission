import React from 'react';
import { marked } from 'marked'; // The library that converts Markdown to HTML

// Configure `marked` to add classes or other options if needed
marked.setOptions({
  breaks: true, // Adds <br> on a single line break
});

const ProblemDisplay = ({ title, description, constraints, examples, difficulty }) => {
  
  // Convert each markdown prop into a raw HTML string
  const descriptionHtml = marked.parse(description || '');
  const constraintsHtml = marked.parse(constraints || '');
  const examplesHtml = marked.parse(examples || '');

  // A map to connect difficulty levels to Tailwind CSS classes for dynamic styling
  const difficultyClassMap = {
    'Easy': 'bg-green-500/10 border-green-500/80 text-green-400',
    'Medium': 'bg-yellow-500/10 border-yellow-400/80 text-yellow-400',
    'Hard': 'bg-red-500/10 border-red-500/80 text-red-400',
  };

  // ✅ 1. A reusable variable for consistent prose styling is created.
  // The base 'prose' class has been changed to 'prose-sm' to reduce the font size
  // of all rendered markdown content.
  const proseClasses = "prose-sm prose prose-invert max-w-none " +
    "prose-headings:text-[#7289da] prose-strong:text-gray-300 prose-strong:font-semibold " +
    "prose-pre:bg-[#23272a] prose-pre:border prose-pre:border-gray-700/60 prose-pre:rounded-lg prose-pre:p-4 prose-pre:text-sm " +
    "prose-code:bg-[#3c4047] prose-code:px-1.5 prose-code:py-1 prose-code:rounded-md";

  return (
    // The main container, styled with Tailwind classes
    // ✅ 2. The base font size is reduced with 'text-sm' and padding is adjusted.
    <div className="h-full w-full overflow-auto box-border bg-[#2f3136] text-gray-300 font-sans p-5 rounded-lg leading-relaxed text-sm">
      
      {/* Container for the title and the badge */}
      <div className="flex items-center gap-4 flex-wrap border-b border-[#4f545c] pb-4 mb-6">
        {/* ✅ 3. Title font size is reduced from 3xl to 2xl */}
        <h1 className="text-2xl font-semibold text-white m-0">{title}</h1>
        {difficulty && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 ${difficultyClassMap[difficulty]}`}>
            {difficulty}
          </span>
        )}
      </div>
      
      {/* Description Section */}
      <div className="mb-5">
        {/* ✅ 4. Section heading size is reduced from xl to lg */}
        <h2 className="text-lg font-medium text-[#7289da] mt-6 mb-3">Description</h2>
        <div 
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: descriptionHtml }} 
        />
      </div>

      {/* Examples Section */}
      <div className="mb-5">
        <h2 className="text-lg font-medium text-[#7289da] mt-6 mb-3">Examples</h2>
        {/* ✅ 5. The examples are now wrapped in a styled container for better visual separation and to ensure styles apply correctly. */}
        <div className="bg-black/20 border border-gray-700/30 rounded-lg p-4">
            <div 
              className={proseClasses}
              dangerouslySetInnerHTML={{ __html: examplesHtml }} 
            />
        </div>
      </div>

      {/* Constraints Section */}
      <div className="mb-5">
        <h2 className="text-lg font-medium text-[#7289da] mt-6 mb-3">Constraints</h2>
        <div className="bg-black/20 border border-gray-700/50 rounded-lg p-4">
            <div 
              className={`${proseClasses} prose-li:marker:text-[#7289da] prose-ul:pl-2`}
              dangerouslySetInnerHTML={{ __html: constraintsHtml }} 
            />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProblemDisplay);

