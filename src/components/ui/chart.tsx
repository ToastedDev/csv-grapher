/* eslint-disable @typescript-eslint/no-explicit-any */

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";

function abbreviate(count: string | number, digits = 3) {
  count = count.toString();
  function abbreviateStep1(value: string | number, digits: number) {
    value = value.toString();
    if (digits == undefined) {
      digits = 3;
    }
    if (parseFloat(value) > 999 || parseFloat(value) < -999) {
      let newValue: any = parseFloat(value);
      const suffixes = ["", "K", "M", "B", "T"];
      let suffixNum = 0;
      while (newValue >= 1000 || newValue <= -1000) {
        newValue /= 1000;
        suffixNum++;
      }
      newValue = newValue.toPrecision(digits);
      newValue += suffixes[suffixNum];
      return newValue;
    } else {
      return parseFloat(value);
    }
  }

  function abbreviateStep2(count: string | number, digits: number) {
    count = count.toString();
    if (digits == undefined) {
      digits = 3;
    }
    if (parseFloat(count) > 999 && parseFloat(count) < 1_000_000_000) {
      count = count.toString();
      const first = count.slice(0, digits);
      const rest = count.slice(digits);
      const abb = new Array(rest.length).fill(0).join("");
      return parseFloat(first + abb);
    } else {
      return count;
    }
  }

  return abbreviateStep1(
    abbreviateStep2(Math.floor(parseFloat(count)), digits),
    digits
  );
}

const colors = [
  [38, 98, 217],
  [46, 184, 138],
  [232, 140, 48],
];

export function Chart({
  series,
  includeTime = false,
  showLegend = false,
}: {
  series: Partial<Highcharts.SeriesOptionsType>[];
  includeTime?: boolean;
  showLegend?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-transparent dark:bg-input/30 p-4 backdrop-blur transition-all">
      <HighchartsReact
        highcharts={Highcharts}
        options={
          {
            chart: {
              type: "area",
              backgroundColor: "transparent",
              zoomType: "x",
              height: 485,
              style: {
                fontFamily: "inherit",
              },
              animation: {
                duration: 1000,
              },
              resetZoomButton: {
                theme: {
                  fill: "hsl(var(--background))",
                  stroke: "rgb(38, 98, 217)",
                  r: 5,
                  style: {
                    fontFamily: "inherit",
                    color: "rgb(38, 98, 217)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  },
                  states: {
                    hover: {
                      fill: "rgb(38, 98, 217)",
                      style: {
                        color: "black",
                      },
                    },
                  },
                },
                position: {
                  align: "right",
                  verticalAlign: "top",
                  x: -10,
                  y: 10,
                },
                // @ts-expect-error - Highcharts types are incorrect
                relativeTo: "chart",
              },
            },
            legend: {
              enabled: showLegend,
              itemStyle: {
                color: "var(--foreground)",
                opacity: 1,
              },
              itemHoverStyle: {
                opacity: 0.5,
              },
            },
            xAxis: {
              type: "datetime",
              labels: {
                format: "{value:%b %d, %Y}",
                style: {
                  color: "var(--foreground)",
                  fontSize: "12px",
                },
              },
              gridLineColor:
                "color-mix(in oklab, var(--foreground) 5%, transparent)",
              lineColor:
                "color-mix(in oklab, var(--foreground) 10%, transparent)",
              tickColor:
                "color-mix(in oklab, var(--foreground) 10%, transparent)",
              crosshair: {
                color:
                  "color-mix(in oklab, var(--foreground) 10%, transparent)",
                dashStyle: "Solid",
              },
            },
            yAxis: {
              title: {
                text: "",
              },
              labels: {
                style: {
                  color: "var(--foreground)",
                  fontSize: "12px",
                },
                formatter: function (this: any): any {
                  return abbreviate(this.value);
                },
              },
              gridLineColor:
                "color-mix(in oklab, var(--foreground) 5%, transparent)",
              lineColor:
                "color-mix(in oklab, var(--foreground) 10%, transparent)",
            },
            credits: {
              enabled: false,
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              borderWidth: 0,
              borderRadius: 8,
              style: {
                color: "#fff",
              },
              xDateFormat: "%B %d, %Y",
              shared: true,
              shadow: false,
              formatter: function (this: any): any {
                return `<span style="font-size: 12px; font-weight: bold">${moment(
                  this.points[0].x
                ).format(
                  includeTime ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD"
                )}</span><br/>${this.points
                  .map(
                    (point: any) =>
                      `<span>${point.series.name}: ${Highcharts.numberFormat(
                        point.y,
                        0,
                        ".",
                        ","
                      )}</span>`
                  )
                  .join("<br/>")}`;
              },
            },
            plotOptions: {
              series: {
                threshold: null,
              },
              area: {
                lineColor: "#2662D9",
                lineWidth: 2,
                marker: {
                  enabled: false,
                  radius: 4,
                  fillColor: "#2662D9",
                  lineWidth: 2,
                  lineColor: "#fff",
                  states: {
                    hover: {
                      enabled: true,
                      lineWidth: 2,
                    },
                  },
                },
                states: {
                  hover: {
                    lineWidth: 3,
                  },
                },
                animation: {
                  duration: 1000,
                },
              },
            },
            title: {
              text: undefined,
            },
            series: series.map((series, index) =>
              Object.assign(
                {
                  type: "area",
                  lineColor: `rgb(${colors[index]?.join(",")})`,
                  fillColor: {
                    linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1,
                    },
                    stops: [
                      [0, `rgba(${colors[index]?.join(",")}, 0.3)`],
                      [1, `rgba(${colors[index]?.join(",")}, 0.02)`],
                    ],
                  },
                  marker: {
                    fillColor: `rgb(${colors[index]?.join(",")})`,
                  },
                  connectNulls: true,
                } satisfies Highcharts.SeriesOptionsType,
                series
              )
            ),
          } satisfies Highcharts.Options
        }
      />
    </div>
  );
}
