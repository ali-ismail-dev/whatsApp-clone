
export function formatMessageDateLong(date) {
    const now = new Date();
    const inputDate = new Date(date);
    if (isToday(inputDate)){
        return inputDate.toLocaleTimeString([],{
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (isYesterday(inputDate)){
        return 'Yesterday'+inputDate.toLocaleTimeString([],{
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (isThisYear(inputDate)){
        return inputDate.toLocaleDateString([],{
            month: 'long',
            day: '2-digit',
        });
    }
    else {
        return inputDate.toLocaleDateString();
    }
}

export function formatMessageDateShort(date) {
    const now = new Date();
    const inputDate = new Date(date);
    if (isToday(inputDate)){
        return inputDate.toLocaleTimeString([],{
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (isYesterday(inputDate)){
        return 'Yesterday';
    } else if (isThisYear(inputDate)){
        return inputDate.toLocaleDateString([],{
            month: 'long',
            day: '2-digit',
        });
    }
    else {
        return inputDate.toLocaleDateString();
    }
}

function isToday(date) {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
}

function isThisYear(date) {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear()
    );
}

