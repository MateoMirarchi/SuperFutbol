function randomItem(items = []) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function getEligibleTeams(teamPool = [], blockedTeamId) {
  return teamPool.filter((team) => String(team.id) !== String(blockedTeamId));
}

function saleAcceptanceChance(priceRatio) {
  if (priceRatio <= 0.85) return 0.97;
  if (priceRatio <= 1.0) return 0.85;
  if (priceRatio <= 1.1) return 0.65;
  if (priceRatio <= 1.2) return 0.4;
  if (priceRatio <= 1.3) return 0.18;
  return 0.05;
}

function evaluateSaleOffer({ player, askingPrice, sellerTeamId, teamPool = [] }) {
  const eligibleTeams = getEligibleTeams(teamPool, sellerTeamId);
  const numericAskingPrice = Number(askingPrice);
  // Number.isFinite(NaN) es false: antes `askingPrice <= 0` con NaN daba
  // `false` (NaN no es <= ni > nada) y la guarda dejaba pasar precios invalidos.
  if (!player || !Number.isFinite(numericAskingPrice) || numericAskingPrice <= 0 || !eligibleTeams.length) {
    return { accepted: false, buyerTeam: null, saleAmount: 0, reason: 'No hay clubes interesados disponibles.' };
  }

  const marketValue = Math.max(1, Math.round(Number(player.value ?? 0)));
  const priceRatio = numericAskingPrice / marketValue;
  const accepted = Math.random() <= saleAcceptanceChance(priceRatio);

  if (!accepted) {
    return {
      accepted: false,
      buyerTeam: null,
      saleAmount: 0,
      reason: priceRatio > 1
        ? 'Ningun club acepto ese precio.'
        : 'Todavia no llego una oferta concreta por el jugador.',
    };
  }

  const buyerTeam = randomItem(eligibleTeams);
  return {
    accepted: true,
    buyerTeam,
    saleAmount: Math.round(numericAskingPrice),
    reason: '',
  };
}

function evaluateLoanOffer({ player, ownerTeamId, teamPool = [] }) {
  const eligibleTeams = getEligibleTeams(teamPool, ownerTeamId);
  if (!player || !eligibleTeams.length) {
    return { accepted: false, loanTeam: null, reason: 'No hay clubes disponibles para recibirlo.' };
  }

  const baseChance = player.status === 'available' ? 0.78 : 0.55;
  const powerBonus = Math.min(0.15, Math.max(0, (Number(player.power ?? 60) - 60) / 200));
  const accepted = Math.random() <= (baseChance + powerBonus);

  if (!accepted) {
    return {
      accepted: false,
      loanTeam: null,
      reason: 'Ningun club quiso llevarselo a prestamo en este momento.',
    };
  }

  return {
    accepted: true,
    loanTeam: randomItem(eligibleTeams),
    reason: '',
  };
}

module.exports = {
  evaluateSaleOffer,
  evaluateLoanOffer,
};
