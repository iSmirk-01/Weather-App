// converts 24h format to 12h format

function convertTo12HourFormat(timeString: string) {
  // splits the time and converted into a Number to work with math
  const [hour, minute] = timeString.split(":").map(Number);

  //calculate the hour to determine pm and am
  const ampm = hour >= 12 ? "PM" : "AM";

  // converts into 12h by leftover % 12 else 12
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

export default convertTo12HourFormat;
