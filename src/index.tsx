import React, { useState } from "react";
import ReactDOM from "react-dom/client";

const App: React.FC = () => {
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [injectedFeatures, setInjectedFeatures] = useState({
    fontSizer: false,
    contrastAdjuster: false,
    focusHighlight: false,
    keyboardNavigation: false,
    screenReader: false
  });

  // Accessibility injection script
  const createAccessibilityScript = () => {
    return `
      (function() {
        // Create accessibility toolbar
        const createAccessibilityToolbar = () => {
          if (document.getElementById('accessibility-toolbar')) return;
          
          const toolbar = document.createElement('div');
          toolbar.id = 'accessibility-toolbar';
          toolbar.style.cssText = \`
            position: fixed;
            top: 10px;
            right: 10px;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 250px;
          \`;
          
          toolbar.innerHTML = \`
            <h3 style="margin: 0 0 10px 0; color: #ecf0f1;">Accessibility Tools</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="font-size-increase" style="padding: 8px; border: none; border-radius: 4px; background: #3498db; color: white; cursor: pointer;">Increase Font Size</button>
              <button id="font-size-decrease" style="padding: 8px; border: none; border-radius: 4px; background: #3498db; color: white; cursor: pointer;">Decrease Font Size</button>
              <button id="toggle-contrast" style="padding: 8px; border: none; border-radius: 4px; background: #e74c3c; color: white; cursor: pointer;">High Contrast</button>
              <button id="toggle-focus" style="padding: 8px; border: none; border-radius: 4px; background: #f39c12; color: white; cursor: pointer;">Focus Highlight</button>
              <button id="toggle-keyboard-nav" style="padding: 8px; border: none; border-radius: 4px; background: #9b59b6; color: white; cursor: pointer;">Keyboard Navigation</button>
              <button id="read-page" style="padding: 8px; border: none; border-radius: 4px; background: #27ae60; color: white; cursor: pointer;">Read Page</button>
              <button id="close-toolbar" style="padding: 8px; border: none; border-radius: 4px; background: #95a5a6; color: white; cursor: pointer;">Close</button>
            </div>
          \`;
          
          document.body.appendChild(toolbar);
          
          // Add event listeners
          addToolbarListeners();
        };
        
        const addToolbarListeners = () => {
          let currentFontScale = 1;
          let highContrastEnabled = false;
          let focusHighlightEnabled = false;
          let keyboardNavEnabled = false;
          
          // Font size controls
          document.getElementById('font-size-increase').addEventListener('click', () => {
            currentFontScale += 0.1;
            document.body.style.fontSize = \`\${currentFontScale}em\`;
          });
          
          document.getElementById('font-size-decrease').addEventListener('click', () => {
            currentFontScale = Math.max(0.8, currentFontScale - 0.1);
            document.body.style.fontSize = \`\${currentFontScale}em\`;
          });
          
          // High contrast toggle
          document.getElementById('toggle-contrast').addEventListener('click', () => {
            highContrastEnabled = !highContrastEnabled;
            if (highContrastEnabled) {
              document.body.style.filter = 'contrast(200%) brightness(150%)';
              document.body.style.background = '#000';
              document.body.style.color = '#fff';
            } else {
              document.body.style.filter = '';
              document.body.style.background = '';
              document.body.style.color = '';
            }
          });
          
          // Focus highlight
          document.getElementById('toggle-focus').addEventListener('click', () => {
            focusHighlightEnabled = !focusHighlightEnabled;
            if (focusHighlightEnabled) {
              const style = document.createElement('style');
              style.id = 'focus-highlight-style';
              style.textContent = \`
                *:focus {
                  outline: 3px solid #ff6b35 !important;
                  outline-offset: 2px !important;
                }
              \`;
              document.head.appendChild(style);
            } else {
              const style = document.getElementById('focus-highlight-style');
              if (style) style.remove();
            }
          });
          
          // Keyboard navigation
          document.getElementById('toggle-keyboard-nav').addEventListener('click', () => {
            keyboardNavEnabled = !keyboardNavEnabled;
            if (keyboardNavEnabled) {
              document.addEventListener('keydown', handleKeyboardNavigation);
            } else {
              document.removeEventListener('keydown', handleKeyboardNavigation);
            }
          });
          
          // Screen reader
          document.getElementById('read-page').addEventListener('click', () => {
            const text = document.body.innerText;
            if ('speechSynthesis' in window) {
              speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 0.8;
              speechSynthesis.speak(utterance);
            } else {
              alert('Speech synthesis not supported in this browser');
            }
          });
          
          // Close toolbar
          document.getElementById('close-toolbar').addEventListener('click', () => {
            const toolbar = document.getElementById('accessibility-toolbar');
            if (toolbar) toolbar.remove();
          });
        };
        
        const handleKeyboardNavigation = (e) => {
          if (e.altKey) {
            switch(e.key) {
              case 'h':
                e.preventDefault();
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                if (headings.length > 0) headings[0].focus();
                break;
              case 'l':
                e.preventDefault();
                const links = document.querySelectorAll('a[href]');
                if (links.length > 0) links[0].focus();
                break;
              case 'b':
                e.preventDefault();
                const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
                if (buttons.length > 0) buttons[0].focus();
                break;
            }
          }
        };
        
        // Initialize
        createAccessibilityToolbar();
      })();
    `;
  };

  const addAccessibilityEmbed = async () => {
    try {
      const script = createAccessibilityScript();
      
      // Create an HTML embed element with the accessibility script
      const htmlEmbed = webflow.elementPresets.HtmlEmbed;
      const embedElement = webflow.elementBuilder(htmlEmbed);
      
      // Get the current page's body or root element
      const rootElement = await webflow.getRootElement();
      if (!rootElement) {
        throw new Error('Could not access page root element');
      }
      
      // Add the HTML embed to the page
      const builtElement = embedElement.append(htmlEmbed);
      
      // Set the HTML content - note: this may not work as expected with HtmlEmbed
      // The user will need to manually edit the HTML embed element
      embedElement.setTextContent(`Accessibility Tools - Please edit this HTML embed and paste the provided code`);
      
      setInjectedFeatures({
        fontSizer: true,
        contrastAdjuster: true,
        focusHighlight: true,
        keyboardNavigation: true,
        screenReader: true
      });
      
      webflow.notify({
        type: 'Info',
        message: 'HTML Embed added! Please edit it and paste the accessibility code.'
      });
      
      // Also show the instructions
      showCustomCodeInstructions();
      
      console.log('Accessibility embed placeholder added');
    } catch (error) {
      console.error('Error adding accessibility embed:', error);
      webflow.notify({
        type: 'Error',
        message: 'Could not add accessibility embed. Please use the manual method.'
      });
      // Fallback to showing instructions
      showCustomCodeInstructions();
    }
  };

  const showCustomCodeInstructions = () => {
    const script = createAccessibilityScript();
    const customCode = `<script>${script}</script>`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(customCode).then(() => {
      webflow.notify({
        type: 'Success',
        message: 'Accessibility code copied to clipboard!'
      });
    }).catch(() => {
      webflow.notify({
        type: 'Warning',
        message: 'Could not copy to clipboard. Please copy the code manually.'
      });
    });
    
    // Show modal with instructions
    setShowInstructions(true);
  };

  const toggleAccessibility = async () => {
    if (isAccessibilityEnabled) {
      // Reset features when disabling
      setInjectedFeatures({
        fontSizer: false,
        contrastAdjuster: false,
        focusHighlight: false,
        keyboardNavigation: false,
        screenReader: false
      });
      webflow.notify({
        type: 'Info',
        message: 'Accessibility tools disabled. Remove the HTML embed or custom code manually.'
      });
    } else {
      await addAccessibilityEmbed();
    }
    setIsAccessibilityEnabled(!isAccessibilityEnabled);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>AccessPro</h1>
      <p style={{ marginBottom: '20px', color: '#34495e' }}>
        Inject accessibility tools directly into your Webflow website to make it more inclusive and user-friendly.
      </p>
      
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={toggleAccessibility}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            background: isAccessibilityEnabled ? '#e74c3c' : '#27ae60',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {isAccessibilityEnabled ? 'Disable Accessibility Tools' : 'Enable Accessibility Tools'}
        </button>
        
        <button 
          onClick={showCustomCodeInstructions}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            background: '#3498db',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          Get Custom Code
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Features Status:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.entries(injectedFeatures).map(([feature, enabled]) => (
            <div key={feature} style={{ 
              padding: '10px', 
              background: enabled ? '#d5f4e6' : '#fadbd8', 
              border: `1px solid ${enabled ? '#27ae60' : '#e74c3c'}`,
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <strong>{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> 
              <span style={{ color: enabled ? '#27ae60' : '#e74c3c', marginLeft: '5px' }}>
                {enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #dee2e6' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>How to use:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
          <li><strong>Option 1 (Recommended):</strong> Click "Get Custom Code" to copy the accessibility script, then add it to your site's custom code in Project Settings {'>'} Custom Code {'>'} Footer Code</li>
          <li><strong>Option 2:</strong> Click "Enable Accessibility Tools" to add an HTML embed element, then edit it and paste the provided code</li>
          <li>The accessibility toolbar will appear on your published site with these features:
            <ul style={{ marginTop: '5px' }}>
              <li>Font size adjustment (increase/decrease)</li>
              <li>High contrast mode toggle</li>
              <li>Focus highlighting for better keyboard navigation</li>
              <li>Keyboard navigation shortcuts (Alt+H for headings, Alt+L for links, Alt+B for buttons)</li>
              <li>Text-to-speech functionality</li>
            </ul>
          </li>
          <li>Users can close the toolbar if needed</li>
        </ol>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Manual Custom Code Setup</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#34495e' }}>Step 1: Copy the Code</h4>
              <p style={{ color: '#6c757d', marginBottom: '10px' }}>
                The accessibility code has been copied to your clipboard. If that didn't work, copy it manually:
              </p>
              <textarea
                readOnly
                value={`<script>${createAccessibilityScript()}</script>`}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#34495e' }}>Step 2: Add to Webflow</h4>
              <ol style={{ color: '#6c757d', paddingLeft: '20px' }}>
                <li>In Webflow Designer, go to Project Settings (gear icon)</li>
                <li>Navigate to Custom Code</li>
                <li>Paste the code in the "Footer Code" section</li>
                <li>Save and publish your site</li>
                <li>The accessibility toolbar will appear on your live site</li>
              </ol>
            </div>
            
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
