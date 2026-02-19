const EPOCH = 1444435200000n; // 2015-10-10T00:00:00.000Z

export function snowflakeToTimestamp(id: string): number {
  return Number((BigInt(id) >> 22n) + EPOCH);
}
