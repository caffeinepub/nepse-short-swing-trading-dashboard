export function getNSTDate(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const nstOffsetMs = (5 * 60 + 45) * 60000;
  return new Date(utcMs + nstOffsetMs);
}

export function getNSTString(): string {
  const nst = getNSTDate();
  const h = String(nst.getHours()).padStart(2, '0');
  const m = String(nst.getMinutes()).padStart(2, '0');
  const s = String(nst.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function isMarketOpen(): boolean {
  const nst = getNSTDate();
  const day = nst.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const isWeekday = day >= 0 && day <= 4; // Sun=0 through Thu=4
  const totalMinutes = nst.getHours() * 60 + nst.getMinutes();
  const isHours = totalMinutes >= 11 * 60 && totalMinutes < 15 * 60;
  return isWeekday && isHours;
}

export function isSunday(): boolean {
  return getNSTDate().getDay() === 0;
}

export function getTodayNSTString(): string {
  const nst = getNSTDate();
  return nst.toISOString().split('T')[0];
}

export function formatNSTDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
