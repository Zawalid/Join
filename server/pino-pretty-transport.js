const pinoPretty = require('pino-pretty');

const colorizeMethod = (method, colors) => {
  switch (method) {
    case 'GET':
      return colors.cyan(method);
    case 'POST':
      return colors.green(method);
    case 'PUT':
      return colors.yellow(method);
    case 'DELETE':
      return colors.red(method);
    default:
      return colors.white(method);
  }
};

const colorizeStatusCode = (statusCode, colors) => {
  if (statusCode >= 500) {
    return colors.red(statusCode);
  } else if (statusCode >= 400) {
    return colors.yellow(statusCode);
  } else if (statusCode >= 300) {
    return colors.cyan(statusCode);
  } else if (statusCode >= 200) {
    return colors.green(statusCode);
  } else {
    return colors.white(statusCode);
  }
};

const formatRequestLog = (log, colors) => {
  return colors.blue(`[REQUEST] ${colorizeMethod(log.req.method, colors)} ${log.req.url}`);
};

const formatResponseLog = (log, colors) => {
  return colors.green(
    `[RESPONSE] ${colorizeStatusCode(log.res.statusCode, colors)} ${colorizeMethod(log.res.method, colors)} ${log.res.url} - ${log.responseTime}ms`
  );
};

module.exports = function pinoPrettyTransport() {
  return pinoPretty({
    colorize: true,
    timestampKey: 'time',
    translateTime: 'HH:MM:ss.l',
    ignore: 'context,pid,hostname,responseTime,reqId,req,res',
    messageFormat: (log, messageKey, levelLabel, { colors }) => {
      if (log.req) {
        return formatRequestLog(log, colors);
      }
      if (log.res) {
        return formatResponseLog(log, colors);
      }
      return `${log.msg}`;
    },
  });
};
