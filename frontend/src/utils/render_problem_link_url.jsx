import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css";
import CodeEditor from './CodeEditor';
import ProblemDisplay from '@/utils/ProblemDisplay';
import { parsedProblemState } from '@/recoil/atoms/problemAtoms';
import { useRecoilState } from 'recoil';

// --- ContextMenu Component ---
const ContextMenu = ({ menu, onHide, onShow, paneVisibility }) => {
  if (!menu.visible) return null;
  const allPanes = ['1', '2', '3', '4'];
  const hiddenPanes = allPanes.filter(key => !paneVisibility[key]);
  const allPanesAreHidden = hiddenPanes.length === allPanes.length;

  return (
    <div
      className="absolute bg-[#18191c] text-[#dcddde] rounded-md shadow-lg p-2 text-sm z-50"
      style={{ top: menu.y, left: menu.x }}
    >
      {!allPanesAreHidden && menu.paneNumber && (
        <div
          className="px-3 py-1 hover:bg-[#7289da] hover:text-white rounded cursor-pointer"
          onClick={() => onHide(menu.paneNumber)}
        >
          {menu.paneNumber==1 && "Hide Problem Pane"}
          {menu.paneNumber==2 && "Hide Console and Verdict Pane"}
          {menu.paneNumber==3 && "Hide CodeEditor Pane"}
          {menu.paneNumber==4 && "Hide Drawing Pane"}
        </div>
      )}
      {!allPanesAreHidden && menu.paneNumber && hiddenPanes.length > 0 && (
        <div className="h-[1px] bg-[#4f545c] my-1" />
      )}
      {hiddenPanes.map(paneNum => (
        <div
          key={paneNum}
          className="px-3 py-1 hover:bg-[#7289da] hover:text-white rounded cursor-pointer"
          onClick={() => onShow(parseInt(paneNum))}
        >
          {paneNum=='1' && "Show Problem Pane"}
          {paneNum=='2' && "Show Console and Verdict Pane"}
          {paneNum=='3' && "Show CodeEditor Pane"}
          {paneNum=='4' && "Show Drawing Pane"}
        </div>
      ))}
    </div>
  );
};


// --- PaneContent Component ---
const PaneContent = React.memo(({ paneNumber, onContextMenu, problemData }) => (
    <div
        className="w-full h-full flex items-center justify-center bg-[#36393f] text-[#dcddde] rounded-lg text-lg select-none"
        onContextMenu={(e) => onContextMenu(e, paneNumber)}
    >
        {paneNumber === 1 && (problemData ? (<ProblemDisplay title={problemData.title} description={problemData.description_md} examples={problemData.examples_md} constraints={problemData.constraints_md} />) : (<div>Loading Problem...</div>))}
        {paneNumber === 2 && "Console and Verdict Center"}
        {paneNumber === 3 && <CodeEditor />}
        {paneNumber === 4 && <Tldraw className='pb-6 bg-white' />}
    </div>
));


// --- Main Resizable Layout Component ---
const ResizableLayout = () => {
  // --- State Management ---
  const [verticalSplit, setVerticalSplit] = useState(50);
  const [leftHorizontalSplit, setLeftHorizontalSplit] = useState(50);
  const [rightHorizontalSplit, setRightHorizontalSplit] = useState(50);
  const [problemData] = useRecoilState(parsedProblemState);
  const [paneVisibility, setPaneVisibility] = useState({ 1: true, 2: true, 3: true, 4: true });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, paneNumber: null });

  const [isOverlayMode, setIsOverlayMode] = useState(false);

  // --- Refs ---
  const containerRef = useRef(null);
  const isDragging = useRef(null);
  const leftColumnRef = useRef(null);

  const onDragStart = (e, divider) => {
    e.preventDefault();
    isDragging.current = divider;

    if (divider === 'vertical' && leftColumnRef.current) {
      const leftColumnRect = leftColumnRef.current.getBoundingClientRect();
      const horizontalDividerY = leftColumnRect.top + (leftColumnRect.height * leftHorizontalSplit / 100);
      
      if (e.clientY < horizontalDividerY) {
        setIsOverlayMode(true);
      }
    }
  };

  const onDragEnd = useCallback(() => {
    isDragging.current = null;
    setIsOverlayMode(false);
  }, []);

  const onDrag = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging.current === 'vertical') {
      const newSplit = ((e.clientX - rect.left) / rect.width) * 100;
      setVerticalSplit(Math.max(5, Math.min(newSplit, 95)));
    } else if (isDragging.current === 'leftHorizontal') {
      const newSplit = ((e.clientY - rect.top) / rect.height) * 100;
      setLeftHorizontalSplit(Math.max(5, Math.min(newSplit, 95)));
    } else if (isDragging.current === 'rightHorizontal') {
      const newSplit = ((e.clientY - rect.top) / rect.height) * 100;
      setRightHorizontalSplit(Math.max(5, Math.min(newSplit, 95)));
    }
  }, []);
  
  // --- Other Handlers and Effects ---
  const handleContextMenu = (e, paneNumber = null) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ FIXED: Calculate the click position relative to the container
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const allPanesAreHidden = Object.values(paneVisibility).every(v => v === false);
        if (allPanesAreHidden) {
          setContextMenu({ visible: true, x: x, y: y, paneNumber: null });
        } else if (paneNumber) {
          setContextMenu({ visible: true, x: x, y: y, paneNumber: paneNumber });
        }
    }
  };

  const closeContextMenu = useCallback(() => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  }, [contextMenu]);
  
  const handleHidePane = (paneNumber) => {
    setPaneVisibility(prev => ({ ...prev, [paneNumber]: false }));
    closeContextMenu();
  };
  
  const handleShowPane = (paneNumber) => {
    setPaneVisibility(prev => ({ ...prev, [paneNumber]: true }));
    closeContextMenu();
  };

  useEffect(() => {
    const handleGlobalClick = () => closeContextMenu();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [closeContextMenu]);

  useEffect(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('mouseleave', onDragEnd);
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('mouseleave', onDragEnd);
    };
  }, [onDrag, onDragEnd]);

  const isLeftColumnVisible = paneVisibility[1] || paneVisibility[2];
  const isRightColumnVisible = paneVisibility[3] || paneVisibility[4];

  return (
    <div 
      className="w-full h-full bg-[#2f3136] p-2 flex font-sans overflow-hidden relative rounded-lg" 
      ref={containerRef}
      onContextMenu={handleContextMenu}
    >
      <ContextMenu menu={contextMenu} onHide={handleHidePane} onShow={handleShowPane} paneVisibility={paneVisibility} />

      {/* Left Column */}
      {isLeftColumnVisible && (
        <div 
          ref={leftColumnRef} 
          className="h-full flex flex-col" 
          style={isOverlayMode ? 
            { width: '100%' } : 
            { width: isRightColumnVisible ? `${verticalSplit}%` : '100%', minWidth: 0 }
          }
        >
          {paneVisibility[1] && ( <div className="w-full p-1" style={{ height: paneVisibility[2] ? `${leftHorizontalSplit}%` : '100%' }}> <PaneContent paneNumber={1} onContextMenu={handleContextMenu} problemData={problemData} /> </div> )}
          {paneVisibility[1] && paneVisibility[2] && ( <div className="w-full h-1 cursor-row-resize bg-[#4f545c] hover:bg-[#7289da] transition-colors duration-200 flex items-center justify-center group" onMouseDown={(e) => onDragStart(e, 'leftHorizontal')}> <div className="h-1 w-8 bg-[#2f3136] group-hover:bg-[#5c6fb1] rounded-full transition-colors duration-200" /> </div> )}
          {paneVisibility[2] && ( <div className="w-full p-1" style={{ height: paneVisibility[1] ? `calc(100% - ${leftHorizontalSplit}%)` : '100%' }}> <PaneContent paneNumber={2} onContextMenu={handleContextMenu} /> </div> )}
        </div>
      )}

      {/* Vertical Divider */}
      {isLeftColumnVisible && isRightColumnVisible && (
        <div
          className="w-1 h-full cursor-col-resize bg-[#4f545c] hover:bg-[#7289da] transition-colors flex items-center justify-center group"
          style={isOverlayMode ? 
            { position: 'absolute', top: '0.5rem', bottom: '0.5rem', zIndex: 20, left: `${verticalSplit}%` } : 
            {}
          }
          onMouseDown={(e) => onDragStart(e, 'vertical')}
        >
          <div className="w-1 h-8 bg-[#2f3136] group-hover:bg-[#5c6fb1] rounded-full" />
        </div>
      )}

      {/* Right Column */}
      {isRightColumnVisible && (
        <div 
          className="h-full flex flex-col"
          style={isOverlayMode ?
            { position: 'absolute', top: '0.5rem', right: '0.5rem', bottom: '0.5rem', zIndex: 10, left: `calc(${verticalSplit}% + 4px)` } :
            { width: isLeftColumnVisible ? `calc(100% - ${verticalSplit}%)` : '100%', minWidth: 0 }
          }
        >
          {paneVisibility[3] && ( <div className="w-full p-1" style={{ height: paneVisibility[4] ? `${rightHorizontalSplit}%` : '100%' }}> <PaneContent paneNumber={3} onContextMenu={handleContextMenu} /> </div> )}
          {paneVisibility[3] && paneVisibility[4] && ( <div className="w-full h-1 cursor-row-resize bg-[#4f545c] hover:bg-[#7289da] transition-colors duration-200 flex items-center justify-center group" onMouseDown={(e) => onDragStart(e, 'rightHorizontal')}> <div className="h-1 w-8 bg-[#2f3136] group-hover:bg-[#5c6fb1] rounded-full transition-colors duration-200" /> </div> )}
          {paneVisibility[4] && ( <div className="w-full p-1" style={{ height: paneVisibility[3] ? `calc(100% - ${rightHorizontalSplit}%)` : '100%' }}> <PaneContent paneNumber={4} onContextMenu={handleContextMenu} /> </div> )}
        </div>
      )}
    </div>
  );
};

export default ResizableLayout;
