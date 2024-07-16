// util/clipboard.js

export const copyToClipboard = async (data) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data));
      console.log('Data copied to clipboard:', data);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };
  
export const pasteFromClipboard = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      return JSON.parse(clipboardData);
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      return null;
    }
  };
  