import { NseIndia } from 'stock-nse-india';

interface ContentPart {
  type: "text";
  text: string;
  [key: string]: any; // Add index signature
}

const nse = new NseIndia();

async function get_price({ symbol }: { symbol: string }): Promise<{ content: ContentPart[] }> {
  const data = await nse.getEquityDetails(symbol);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          symbol: data.metadata.symbol,
          lastPrice: data.priceInfo.lastPrice,
          change: data.priceInfo.change,
          pChange: data.priceInfo.pChange,
        }, null, 2),
      },
    ],
  };
}

async function get_trend({ symbol, days }: { symbol: string; days?: number | undefined }): Promise<{ content: ContentPart[] }> {
  const end = new Date();
  const start = new Date(end.getTime() - (days || 30) * 24 * 60 * 60 * 1000);

  const history = await nse.getEquityHistoricalData(symbol, { start, end });

  if (!history || history.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: 'No historical data available for the given symbol and date range.',
        },
      ],
    };
  }

  const startPrice = history[0]?.data[0]?.CH_CLOSING_PRICE;
  const endPrice = history.at(-1)?.data[0]?.CH_CLOSING_PRICE;
  if (startPrice === undefined || endPrice === undefined) {
    return {
      content: [
        {
          type: "text",
          text: 'Historical data is missing price information.',
        },
      ],
    };
  }
  const pctChange = ((endPrice - startPrice) / startPrice) * 100;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          startPrice,
          endPrice,
          pctChange: pctChange.toFixed(2),
          trend: pctChange > 0 ? 'upward' : 'downward',
        }, null, 2),
      },
    ],
  };
}

async function should_i_buy({ symbol }: { symbol: string }): Promise<{ content: ContentPart[] }> {
  const trendResponse = await get_trend({ symbol });
  let advice = "neutral";
  let reason = "";

  if (trendResponse.content && trendResponse.content[0] && trendResponse.content[0].type === "text") {
    try {
      const trend = JSON.parse(trendResponse.content[0].text);
      const pct = parseFloat(trend.pctChange);

      if (pct < -5) advice = "buy";
      else if (pct > 5) advice = "hold";

      reason = `30-day trend is ${trend.pctChange}% (${trend.trend})`; 
    } catch (e) {
      reason = "Could not parse trend data.";
    }
  } else {
    reason = "Could not retrieve trend data.";
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          advice,
          reason,
        }, null, 2),
      },
    ],
  };
}

export {
  get_price,
  get_trend,
  should_i_buy,
};
