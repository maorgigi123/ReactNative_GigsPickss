export const CalcData = (date,add=false) => {
    const currentDate = new Date();
    const givenDate = new Date(date);
    const timeDifference = currentDate - givenDate;
  
    // Convert milliseconds to seconds
    const secondsPassed = Math.floor(timeDifference / 1000);
  
    // Convert milliseconds to minutes
    const minutesPassed = Math.floor(timeDifference / (1000 * 60));
  
    // Convert milliseconds to hours
    const hoursPassed = Math.floor(timeDifference / (1000 * 60 * 60));
  
    // Convert milliseconds to days
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
    // Calculate the difference in years
    const yearsPassed = currentDate.getFullYear() - givenDate.getFullYear();
    const fullYearGivenDate = new Date(givenDate);
    fullYearGivenDate.setFullYear(currentDate.getFullYear());
    const adjustedYearsPassed = currentDate < fullYearGivenDate ? yearsPassed - 1 : yearsPassed;

    if (adjustedYearsPassed > 0) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return givenDate.toLocaleDateString('en-US', options);
    } else if (daysPassed > 0) {
      if(daysPassed > 7)
      {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return givenDate.toLocaleDateString('en-US', options);
      }
      return daysPassed + (add ? ' days ago' :'d');
    } else if (hoursPassed > 0) {
      return hoursPassed + (add ? ' hours ago' :'h');
    } else if (minutesPassed > 0) {
      return minutesPassed + (add ? ' minutes ago' :'m');
    } else {
        if(secondsPassed <= 1)
        {
            return 'now';
        }
      return secondsPassed +(add ? ' seconds ago' :'s');
    }
  };
  export const ShortCalcData = (date, add = false) => {
    const currentDate = new Date();
    const givenDate = new Date(date);
    let timeDifference = Math.floor((currentDate - givenDate) / 1000); // Convert milliseconds to seconds
  
    // Calculate each time unit
    const years = Math.floor(timeDifference / (365 * 24 * 60 * 60));
    timeDifference -= years * 365 * 24 * 60 * 60;
  
    const months = Math.floor(timeDifference / (30 * 24 * 60 * 60));
    timeDifference -= months * 30 * 24 * 60 * 60;
  
    const days = Math.floor(timeDifference / (24 * 60 * 60));
    timeDifference -= days * 24 * 60 * 60;
  
    const hours = Math.floor(timeDifference / (60 * 60));
    timeDifference -= hours * 60 * 60;
  
    const minutes = Math.floor(timeDifference / 60);
    const seconds = timeDifference % 60;
  
    // Format each part if it has a value
    const parts = [];
    if (years) parts.push(years + (add ? (years === 1 ? ' year' : ' years') : 'y'));
    else if (months) parts.push(months + (add ? (months === 1 ? ' month' : ' months') : 'mo'));
    else if (days) parts.push(days + (add ? (days === 1 ? ' day' : ' days') : 'd'));
    else if (hours) parts.push(hours + (add ? (hours === 1 ? ' hour' : ' hours') : 'h'));
    else if (minutes) parts.push(minutes + (add ? (minutes === 1 ? ' minute' : ' minutes') : 'm'));
    else if (seconds || parts.length === 0) parts.push(seconds + (add ? (seconds === 1 ? ' second' : ' seconds') : 's'));
  
    // Join all parts with a space
    return parts.join(' ');
  };
  
  

  // Function to format the date
export function formatTimestamp(timestamp) {
  // Create a Date object from the timestamp
  const date = new Date(timestamp);
  
  // Get the day of the week, e.g., "Tue"
  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  
  // Get the time in the format "6:31 PM"
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
  
  // Combine and return the formatted string
  return `${dayOfWeek} ${time}`;
}