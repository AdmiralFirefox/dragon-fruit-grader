import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

interface DonutChartProps {
  probability: number;
}

ChartJS.register(ArcElement, Tooltip);

const DonutChart = ({ probability }: DonutChartProps) => {
  const foreground = "hsl(342, 65%, 60%)";
  const foregroundHover = "hsl(342, 65%, 65%)";
  const background = "hsl(20, 90%, 93%)";
  const backgroundHover = "hsl(20, 90%, 94%)";

  const data = {
    labels: ["Likely", "Unlikely"],
    datasets: [
      {
        data: [probability, 100 - probability],
        backgroundColor: [foreground, background],
        borderColor: [foreground, background],
        hoverBackgroundColor: [foregroundHover, backgroundHover],
        hoverBorderColor: [foregroundHover, backgroundHover],
        borderWidth: 1,
      },
    ],
  };

  return <Doughnut data={data} />;
};

export default DonutChart;
