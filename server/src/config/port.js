import net from 'node:net';

export const getPortCandidates = (preferredPort, maxAttempts = 20) => {
  const candidates = [];

  for (let index = 0; index < maxAttempts; index += 1) {
    candidates.push(preferredPort + index);
  }

  return candidates;
};

export const isPortAvailable = async (port) => {
  const hosts = ['127.0.0.1', '::1', '0.0.0.0'];

  for (const host of hosts) {
    const available = await new Promise((resolve) => {
      const tester = net.createServer();

      tester.once('error', () => resolve(false));
      tester.once('listening', () => {
        tester.close(() => resolve(true));
      });

      tester.listen({ port, host, exclusive: true });
    });

    if (!available) {
      return false;
    }
  }

  return true;
};

export const findAvailablePort = async (preferredPort = 4500, maxAttempts = 20) => {
  for (const port of getPortCandidates(preferredPort, maxAttempts)) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(
    `No free port available in range ${preferredPort} to ${preferredPort + maxAttempts - 1}`
  );
};
