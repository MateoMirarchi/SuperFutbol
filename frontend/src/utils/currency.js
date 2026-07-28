export function kToMoney(valueK = 0) {
  return Math.round(Number(valueK ?? 0) * 1000);
}

export function formatMoneyFull(value = 0) {
  return `$${Math.round(Number(value ?? 0)).toLocaleString('es-AR')}`;
}

export function moneyToMillions(value = 0) {
  return Number(value ?? 0) / 1_000_000;
}

export function formatMoneyShort(value = 0) {
  const amount = Number(value ?? 0);

  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `$${Math.round(amount / 1000).toLocaleString('es-AR')}K`;
  }

  return `$${Math.round(amount).toLocaleString('es-AR')}`;
}