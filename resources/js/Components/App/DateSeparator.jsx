import React from 'react';

/**
 * Formats a date for display in the separator
 * Returns "Today", "Yesterday", or a formatted date
 */
function formatDateSeparator(dateString) {
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
 * WhatsApp-style date separator component
 */
export default function DateSeparator({ date }) {
  return (
    <div className="flex justify-center items-center my-4">
      <div className="bg-gray-600/50 text-gray-200 text-xs px-3 py-1 rounded-full shadow-sm">
        {formatDateSeparator(date)}
      </div>
    </div>
  );
}

/**
 * Groups messages by date
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