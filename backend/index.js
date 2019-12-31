// graphql.js
import * as tf from "@tensorflow/tfjs";

const { ApolloServer, gql } = require("apollo-server-lambda");
const { GraphQLDate } = require("graphql-iso-date");
const model = await tf.loadLayersModel("model.h5");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  scalar Date

  enum CodeType {
    POSTAL
    ZIP
  }

  type Code {
    codeValue: String!
    type: CodeType!
  }

  type PredictionResult {
    error: Error
    data: PredictionResultData
  }

  type PredictionResultData {
    chance: Float!
    location: Location!
    date: Date!
  }

  type Location {
    code: Code!
  }

  type Error {
    id: ID!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    prediction(code: String!): PredictionResult
  }
`;

function getMinTemp(minTemp, weather) {
  const curMinTemp = weather.main.temp_min;
  if (minTemp > curMinTemp) {
    return curMinTemp;
  } else {
    return minTemp;
  }
}

function getMaxTemp(maxTemp, weather) {
  const curMaxTemp = weather.main.temp_max;
  if (maxTemp < curMaxTemp) {
    return curMaxTemp;
  } else {
    return maxTemp;
  }
}

function getTotalRain(totalRain, weather) {
  return totalRain + weather.rain["3h"];
}

function getTotalSnow(totalSnow, weather) {
  return totalSnow + weather.snow["3h"];
}

function getTotalPrecip(totalSnow, totalRain) {
  return totalSnow + totalRain;
}

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Date: GraphQLDate,
  Query: {
    async prediction(parent, args, context, info) {
      let countryCode, apiURL, apiData, currentDate;
      let maxTemp, minTemp, totalRain, totalSnow, totalPrecip;
      const today = new Date();

      //  Determines the country code
      if (args.code.charAt(0) < "0" && args.code.charAt(0) > "9") {
        countryCode = "CA";
      } else {
        countryCode = "US";
      }

      // Determines API URL based on countryCode
      if (countryCode === "CA") {
        apiURL =
          "http://api.openweathermap.org/data/2.5/forecast?zip=" +
          args.code +
          ",CA&appid=" +
          process.env.key;
      }

      // Code is from the US
      else {
        apiURL =
          "http://api.openweathermap.org/data/2.5/forecast?zip=" +
          args.code +
          "&appid=" +
          process.env.key;
      }

      // Retrieves weather data from the API
      apiData = await $.getJSON(apiURL);

      const nextDayData = apiData.list.filter(
        datum => currentDate === datum.dt_txt.slice(0, 10)
      );

      // Adjusts time based on timezone relative to UTC
      today.setSeconds(today.getSeconds() + apiData.city.timezone);

      // Determining time based on user's timezone
      if (today.getHours() >= 2) {
        today.setDate(today.getDate() + 1);
      }

      // Converts Date to string
      currentDate = today.toISOString().slice(0, 10);

      // Determining values for parameters in the model
      maxTemp = nextDayData.reduce(
        getMaxTemp,
        nextDayData[0].main.temp_min
      );
      minTemp = nextDayData.reduce(
        getMinTemp,
        nextDayData[0].main.temp_min
      );
      totalRain = nextDayData.reduce(getTotalRain, 0);
      totalSnow = nextDayData.reduce(getTotalSnow, 0);
      totalPrecip = totalRain + totalSnow;

      return {
        data: {
          chance: model.predict(maxTemp, minTemp, totalRain, totalSnow, totalPrecip),
          location: {
            code: {
              codeValue: args.code,
              type: countryCode === "CA"? "POSTAL": "ZIP"
            }
          },
          date: today
        }
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context
  }),
  introspection: true,
  playground: true
});

exports.handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});
