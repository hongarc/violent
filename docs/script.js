// Get the input textarea element
const inputTextarea = document.getElementById('inputContent');

// Get the output content, copy button, and output area elements
const outputContent = document.getElementById('outputContent');
const copyButton = document.getElementById('copyButton');
const outputArea = document.getElementById('outputArea');

function convertMethods(inputString) {
  // Regular expression to match static method declarations
  const methodRegex = /\s*static\s+(async\s+)?(\w+)\(([^)]*)\)\s*{\s*return (\w+)\.(\w+)\(([^)]*)\);\s*}/g;

  // Replace static method declarations with the desired output
  const convertedString = inputString.replace(
    methodRegex,
    (match, isAsync, methodName, params, serviceName, serviceMethodName, serviceParams) => {
      const asyncKeyword = isAsync ? 'async ' : '';
      return `
${asyncKeyword}function ${methodName}(${params}) {
  return ${serviceName}.${serviceMethodName}(${serviceParams});
}
exports.${methodName} = ${methodName};\n`;
    },
  );

  return convertedString.replace(/class .+ {\s*/, '').replace(/}((\n\s*)*module.exports = .+(\n\s*)*)?$/, '//injection').trim();
}

// Add an event listener to the input textarea for the 'input' event
inputTextarea.addEventListener('input', () => {
  // Get the input content
  const inputContent = inputTextarea.value;

  // Perform the conversion
  const convertedContent = convertMethods(inputContent);

  // Display the result in the output area and apply syntax highlighting
  outputContent.innerHTML = convertedContent;
  delete outputContent.dataset.highlighted;
  hljs.highlightElement(outputContent);
});

// Function to copy the output content to the clipboard
function copyToClipboard() {
  // Create a temporary textarea to copy the content
  const tempTextarea = document.createElement('textarea');
  tempTextarea.value = outputContent.innerText;
  outputArea.appendChild(tempTextarea);

  // Select the text inside the temporary textarea
  tempTextarea.select();
  document.execCommand('copy');

  // Remove the temporary textarea
  outputArea.removeChild(tempTextarea);

  // Provide visual feedback (you can customize this part)
  copyButton.innerText = 'Copied!';
  setTimeout(() => {
    copyButton.innerText = 'Copy';
  }, 1500);
}
