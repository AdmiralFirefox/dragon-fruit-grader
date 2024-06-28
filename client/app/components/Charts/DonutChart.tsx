import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

interface DonutChartProps {
  probability: number;
}

ChartJS.register(ArcElement, Tooltip);

const DonutChart = ({ probability }: DonutChartProps) => {
  const data = {
    labels: ["Likely", "Unlikely"],
    datasets: [
      {
        data: [probability, 100 - probability],
        backgroundColor: ["#D0D6B5", "#E3E3DF"],
        borderColor: ["#D0D6B5", "#E3E3DF"],
        hoverBackgroundColor: ["#A5A675", "#EDEEE8"],
        hoverBorderColor: ["#A5A675", "#EDEEE8"],
        borderWidth: 1,
      },
    ],
  };

  return <Doughnut data={data} />;
};

export default DonutChart;
