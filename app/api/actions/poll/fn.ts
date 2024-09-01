import { createCanvas, registerFont } from "canvas";
import path from "path";

export function createBarGraph(voteA: number, voteB: number): string {
  const fontPath = path.join(process.cwd(), "public", "arial.ttf");
  registerFont(fontPath, { family: "Arial" });

  const width = 400;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Set up bar width and spacing
  const barWidth = 100;
  const barSpacing = 50;
  const maxBarHeight = height - 120;

  // Calculate bar heights based on votes
  const maxVote = Math.max(voteA, voteB);
  const voteAHeight = (voteA / maxVote) * maxBarHeight;
  const voteBHeight = (voteB / maxVote) * maxBarHeight;

  // Set background color to #2658dd
  ctx.fillStyle = "#2658dd";
  ctx.fillRect(0, 0, width, height);

  // Add decorative circles
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 20,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
    ctx.fill();
  }

  // Add title "Vote Distribution" with shadow
  ctx.fillStyle = "white";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  ctx.fillText("Vote Distribution", width / 2, 40);
  ctx.shadowColor = "transparent";

  // Function to draw rounded rectangle
  function roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  // Draw bars with white fill and rounded corners
  ctx.fillStyle = "white";
  roundRect(barSpacing, height - voteAHeight, barWidth, voteAHeight, 10);
  ctx.fill();
  roundRect(
    barSpacing + barWidth + barSpacing,
    height - voteBHeight,
    barWidth,
    voteBHeight,
    10
  );
  ctx.fill();

  // Add labels with enhanced styling
  ctx.fillStyle = "white";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;

  ctx.fillText(
    `Vote A: ${voteA}`,
    barSpacing + barWidth / 2,
    height - voteAHeight - 15
  );
  ctx.fillText(
    `Vote B: ${voteB}`,
    barSpacing + barWidth + barSpacing + barWidth / 2,
    height - voteBHeight - 15
  );

  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, "#FFD700");
  borderGradient.addColorStop(0.5, "#FF69B4");
  borderGradient.addColorStop(1, "#00CED1");

  return canvas.toDataURL("image/png");
}
