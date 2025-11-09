// Helpers.js - Add these helper functions

/**
 * Format time only (no date) for messages - WhatsApp style
 * Example: "2:45 PM"
 */
export function formatMessageTime(value) {
  try {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    return d.toLocaleTimeString([], { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  } catch {
    return String(value);
  }
}

/**
 * Format date for separators - WhatsApp style
 * Returns "Today", "Yesterday", or formatted date
 */
export function formatDateSeparator(dateString) {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  messageDate.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return "Today";
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    // Format as "Jan 15, 2024" or similar
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Keep your existing formatMessageDateLong for other uses if needed
 */
export function formatMessageDateLong(value) {
  try {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

/**
 * Groups messages by date for WhatsApp-style date separators
 * Returns an array of objects: { type: 'date', date: '...' } or { type: 'message', message: {...} }
 */
export function groupMessagesByDate(messages) {
  if (!messages || messages.length === 0) return [];

  const grouped = [];
  let currentDate = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const messageDateString = messageDate.toDateString();

    // If this is a new date, add a date separator
    if (messageDateString !== currentDate) {
      grouped.push({
        type: 'date',
        date: message.created_at,
        id: `date-${messageDateString}` // Unique key for React
      });
      currentDate = messageDateString;
    }

    // Add the message
    grouped.push({
      type: 'message',
      message: message,
      id: message.id
    });
  });

  return grouped;
}

export const isImage = (attachment) => {
  if (!attachment) return false;
  let mime = attachment.mime || attachment.type;
  mime = mime.split(';')[0].split('/')[0].toLowerCase();
  return mime === 'image'; 
};

export const isAudio = (attachment) => {
  if (!attachment) return false;
  let mime = attachment.mime || attachment.type;
  mime = mime.split(';')[0].split('/')[0].toLowerCase();
  return mime === 'audio'; 
};

export const isVideo = (attachment) => {
  if (!attachment) return false;
  let mime = attachment.mime || attachment.type;
  mime = mime.split(';')[0].split('/')[0].toLowerCase();
  return mime === 'video'; 
};

export const isPDF = (attachment) => {
  if (!attachment) return false; // handle undefined/null
  let mime = attachment.mime || attachment.type || '';
  mime = mime.split(';')[0].split('/')[0].toLowerCase();
  return mime === 'application' && (attachment.mime?.includes('pdf') || attachment.type?.includes('pdf'));
};


export const isPreviewable = (attachment) => {
  if (!attachment) return false;
  return isImage(attachment) || isAudio(attachment) || isVideo(attachment) || isPDF(attachment);
};

export const formatByets = (bytes, decimals = 2) => {
  
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1073741824) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  } else {
    return (bytes / 1073741824).toFixed(1) + ' GB';
  }
};
