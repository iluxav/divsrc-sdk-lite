
const LOG_PREFIX = '[DivSrc]'


export function log(..._args: string[]) {
  if (window.divSrcSdk && window.divSrcSdk.debug) {
    const args: any = Array.prototype.slice.call(_args);
    args.unshift(LOG_PREFIX + " ");
    console.log.apply(console, args);
  }
}

export function error(..._args: string[]) {
  const args: any = Array.prototype.slice.call(_args);
  args.unshift(LOG_PREFIX + " Error: ");
  console.error.apply(console, args);
}
