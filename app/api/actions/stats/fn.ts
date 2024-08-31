import { createCanvas } from "canvas";

// Function to generate heatmap
export function generateHeatmap(dates: number[]): string {
  if (!dates || dates.length === 0) {
    console.error("No valid dates provided for heatmap generation");
    return "";
  }

  try {
    const canvas = createCanvas(2400, 600);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    const cellSize = 32;
    const cellPadding = 4;
    const colorScale = [
      "#eeeeee", // 0 (no activity)
      "#d6e685", // 1-2
      "#8cc665", // 3-5
      "#44a340", // 6-10
      "#1e6823", // 11-20
      "#0e4817", // 21- ...
    ];
    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Determine the current month and create a dynamic month array
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const nextMonthIndex = (currentMonthIndex + 1) % 12;
    const months = [
      ...allMonths.slice(nextMonthIndex),
      ...allMonths.slice(0, nextMonthIndex),
    ];

    // Create a map to count transactions per day
    const dateCounts = dates.reduce((acc, timestamp) => {
      if (typeof timestamp !== "number" || isNaN(timestamp)) {
        console.warn(`Invalid timestamp encountered: ${timestamp}`);
        return acc;
      }
      const seconds =
        timestamp > 1e10 ? Math.floor(timestamp / 1000) : timestamp;
      const date = new Date(seconds * 1000);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date created from timestamp: ${seconds}`);
        return acc;
      }
      const dateString = date.toISOString().split("T")[0];
      acc[dateString] = (acc[dateString] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(dateCounts).length === 0) {
      throw new Error("No valid dates found in the provided data");
    }

    type FormattedDate = { date: string; count: number };

    // Assuming dateCounts is of type Record<string, number>
    // Transform dateCounts to the desired array format
    const formattedDates: FormattedDate[] = Object.entries(dateCounts).map(
      ([date, count]) => ({
        date: date.replace(/-/g, "/"), // Convert 'YYYY-MM-DD' to 'YYYY/MM/DD'
        count,
      })
    );

    // Sort the array by date in ascending order
    formattedDates.sort(
      (a, b) =>
        new Date(a.date.replace(/\//g, "-")).getTime() -
        new Date(b.date.replace(/\//g, "-")).getTime()
    );

    // If you prefer descending order, use:
    // formattedDates.sort((a, b) => new Date(b.date.replace(/\//g, '-')).getTime() - new Date(a.date.replace(/\//g, '-')).getTime());
    console.log("Formatted Dates:", formattedDates);

    // Adjust start date to be one year ago from the next month
    const startDate = new Date(
      now.getFullYear() - 1,
      (now.getMonth() + 1) % 12,
      1
    );

    // Fill background
    ctx.fillStyle = "#f6f8fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = "#24292e";
    ctx.font = "bold 36px Arial";
    ctx.fillText("Transaction Activity Heatmap", 50, 70);
    ctx.font = "24px Arial";

    // Draw month labels
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = "#586069";
      ctx.fillText(months[i], i * (cellSize + cellPadding) * 4.4 + 120, 140);
    }

    let currentDate = new Date(startDate);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set to end of the day

    let x = 120;
    let y = currentDate.getDay() * (cellSize + cellPadding) + 170;

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      const count = dateCounts[dateString] || 0;
      const colorIndex = getColorIndex(count);

      ctx.fillStyle = colorScale[colorIndex];
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 4);
      ctx.fill();

      y += cellSize + cellPadding;
      if (y >= 7 * (cellSize + cellPadding) + 170) {
        y = 170;
        x += cellSize + cellPadding;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Draw legend
    const legendX = 120;
    const legendY = canvas.height - 70;
    ctx.fillStyle = "#586069";
    ctx.fillText("Less", legendX, legendY);
    for (let i = 0; i < colorScale.length; i++) {
      ctx.fillStyle = colorScale[i];
      ctx.beginPath();
      ctx.roundRect(legendX + 80 + i * 60, legendY - 30, 48, 48, 4);
      ctx.fill();
    }
    ctx.fillStyle = "#586069";
    ctx.fillText("More", legendX + 80 + colorScale.length * 60 + 20, legendY);

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating heatmap:", error);
    return "";
  }
}

function getColorIndex(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  if (count <= 20) return 4;
  return 5;
}
