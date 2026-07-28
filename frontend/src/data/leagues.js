/**
 * leagues.js
 * Datos de ligas y equipos agrupados por país y división.
 * Cada país tiene 4 divisiones de 10 equipos.
 * 
 * Estructura:
 *   { id, name, country, flag, divisions: [ { level, name, teams: [...] } ] }
 */

export const LEAGUES = [
  // ─────────────── ARGENTINA ───────────────
  {
    id: 'arg',
    name: 'Liga Argentina',
    country: 'Argentina',
    flag: '🇦🇷',
    divisions: [
      {
        level: 1,
        name: 'Primera División',
        teams: [
          { id: 'arg-1-1', name: 'Boca Juniors',       shortName: 'BOC', city: 'Buenos Aires', prestige: 95 },
          { id: 'arg-1-2', name: 'River Plate',         shortName: 'RIV', city: 'Buenos Aires', prestige: 96 },
          { id: 'arg-1-3', name: 'Racing Club',         shortName: 'RAC', city: 'Avellaneda',   prestige: 82 },
          { id: 'arg-1-4', name: 'Independiente',       shortName: 'IND', city: 'Avellaneda',   prestige: 80 },
          { id: 'arg-1-5', name: 'San Lorenzo',         shortName: 'SLO', city: 'Buenos Aires', prestige: 81 },
          { id: 'arg-1-6', name: 'Huracán',             shortName: 'HUR', city: 'Buenos Aires', prestige: 72 },
          { id: 'arg-1-7', name: 'Estudiantes',         shortName: 'EST', city: 'La Plata',     prestige: 78 },
          { id: 'arg-1-8', name: 'Lanús',               shortName: 'LAN', city: 'Lanús',        prestige: 74 },
          { id: 'arg-1-9', name: 'Vélez Sarsfield',     shortName: 'VEL', city: 'Buenos Aires', prestige: 79 },
          { id: 'arg-1-10', name: 'Talleres',           shortName: 'TAL', city: 'Córdoba',      prestige: 73 },
        ],
      },
      {
        level: 2,
        name: 'Primera Nacional',
        teams: [
          { id: 'arg-2-1',  name: 'Belgrano',          shortName: 'BEL', city: 'Córdoba',     prestige: 66 },
          { id: 'arg-2-2',  name: 'San Martín (SJ)',   shortName: 'SMS', city: 'San Juan',    prestige: 58 },
          { id: 'arg-2-3',  name: 'Quilmes',           shortName: 'QUI', city: 'Quilmes',     prestige: 60 },
          { id: 'arg-2-4',  name: 'Almirante Brown',   shortName: 'ABR', city: 'Adrogué',     prestige: 55 },
          { id: 'arg-2-5',  name: 'Brown de Adrogué',  shortName: 'BRO', city: 'Adrogué',     prestige: 52 },
          { id: 'arg-2-6',  name: 'Nueva Chicago',     shortName: 'NCH', city: 'Buenos Aires', prestige: 54 },
          { id: 'arg-2-7',  name: 'Deportivo Morón',   shortName: 'DMO', city: 'Morón',       prestige: 53 },
          { id: 'arg-2-8',  name: 'Riestra',           shortName: 'RIE', city: 'Buenos Aires', prestige: 50 },
          { id: 'arg-2-9',  name: 'Gimnasia (J)',      shortName: 'GIM', city: 'Jujuy',       prestige: 49 },
          { id: 'arg-2-10', name: 'Chacarita',         shortName: 'CHA', city: 'San Martín',  prestige: 57 },
        ],
      },
      {
        level: 3,
        name: 'Primera B Metropolitana',
        teams: [
          { id: 'arg-3-1',  name: 'Atlanta',           shortName: 'ATL', city: 'Buenos Aires', prestige: 45 },
          { id: 'arg-3-2',  name: 'Fénix',             shortName: 'FEN', city: 'Buenos Aires', prestige: 43 },
          { id: 'arg-3-3',  name: 'Los Andes',         shortName: 'LAN', city: 'Lomas de Zamora', prestige: 44 },
          { id: 'arg-3-4',  name: 'Acassuso',          shortName: 'ACA', city: 'Acassuso',    prestige: 38 },
          { id: 'arg-3-5',  name: 'Comunicaciones',    shortName: 'COM', city: 'Mercedes',    prestige: 37 },
          { id: 'arg-3-6',  name: 'Deportivo Español', shortName: 'DES', city: 'Buenos Aires', prestige: 40 },
          { id: 'arg-3-7',  name: 'Lugano',            shortName: 'LUG', city: 'Buenos Aires', prestige: 35 },
          { id: 'arg-3-8',  name: 'El Porvenir',       shortName: 'EPO', city: 'Gerli',       prestige: 33 },
          { id: 'arg-3-9',  name: 'Excursionistas',    shortName: 'EXC', city: 'Buenos Aires', prestige: 36 },
          { id: 'arg-3-10', name: 'Midland',           shortName: 'MID', city: 'Moreno',      prestige: 32 },
        ],
      },
      {
        level: 4,
        name: 'Primera C',
        teams: [
          { id: 'arg-4-1',  name: 'Argentino (Q)',     shortName: 'ARQ', city: 'Quilmes',     prestige: 28 },
          { id: 'arg-4-2',  name: 'Victoriano Arenas', shortName: 'VIA', city: 'Gerli',       prestige: 26 },
          { id: 'arg-4-3',  name: 'Central Córdoba (R)', shortName: 'CCR', city: 'Rosario',   prestige: 27 },
          { id: 'arg-4-4',  name: 'Claypole',          shortName: 'CLA', city: 'Claypole',    prestige: 24 },
          { id: 'arg-4-5',  name: 'Dock Sud',          shortName: 'DSU', city: 'Dock Sud',    prestige: 25 },
          { id: 'arg-4-6',  name: 'Liniers',           shortName: 'LIN', city: 'Liniers',     prestige: 23 },
          { id: 'arg-4-7',  name: 'Luján',             shortName: 'LUJ', city: 'Luján',       prestige: 22 },
          { id: 'arg-4-8',  name: 'Sportivo Italiano', shortName: 'SIT', city: 'Buenos Aires', prestige: 21 },
          { id: 'arg-4-9',  name: 'Lamadrid',          shortName: 'LAM', city: 'Buenos Aires', prestige: 20 },
          { id: 'arg-4-10', name: 'Ituzaingó',         shortName: 'ITU', city: 'Ituzaingó',   prestige: 19 },
        ],
      },
    ],
  },

  // ─────────────── BRASIL ───────────────
  {
    id: 'bra',
    name: 'Liga Brasileña',
    country: 'Brasil',
    flag: '🇧🇷',
    divisions: [
      {
        level: 1,
        name: 'Série A',
        teams: [
          { id: 'bra-1-1',  name: 'Flamengo',          shortName: 'FLA', city: 'Río de Janeiro', prestige: 96 },
          { id: 'bra-1-2',  name: 'Palmeiras',         shortName: 'PAL', city: 'São Paulo',      prestige: 95 },
          { id: 'bra-1-3',  name: 'Fluminense',        shortName: 'FLU', city: 'Río de Janeiro', prestige: 87 },
          { id: 'bra-1-4',  name: 'Athletico-PR',      shortName: 'CAP', city: 'Curitiba',       prestige: 83 },
          { id: 'bra-1-5',  name: 'Corinthians',       shortName: 'COR', city: 'São Paulo',      prestige: 90 },
          { id: 'bra-1-6',  name: 'São Paulo FC',      shortName: 'SAO', city: 'São Paulo',      prestige: 88 },
          { id: 'bra-1-7',  name: 'Atlético Mineiro',  shortName: 'CAM', city: 'Belo Horizonte', prestige: 89 },
          { id: 'bra-1-8',  name: 'Internacional',     shortName: 'INT', city: 'Porto Alegre',   prestige: 86 },
          { id: 'bra-1-9',  name: 'Grêmio',            shortName: 'GRE', city: 'Porto Alegre',   prestige: 87 },
          { id: 'bra-1-10', name: 'Santos',            shortName: 'SAN', city: 'Santos',         prestige: 85 },
        ],
      },
      {
        level: 2,
        name: 'Série B',
        teams: [
          { id: 'bra-2-1',  name: 'Cruzeiro',          shortName: 'CRU', city: 'Belo Horizonte', prestige: 78 },
          { id: 'bra-2-2',  name: 'Botafogo (SP)',      shortName: 'BOT', city: 'Ribeirão Preto', prestige: 60 },
          { id: 'bra-2-3',  name: 'Guarani',           shortName: 'GUA', city: 'Campinas',       prestige: 62 },
          { id: 'bra-2-4',  name: 'Mirassol',          shortName: 'MIR', city: 'Mirassol',       prestige: 55 },
          { id: 'bra-2-5',  name: 'Ponte Preta',       shortName: 'PPR', city: 'Campinas',       prestige: 63 },
          { id: 'bra-2-6',  name: 'Ituano',            shortName: 'ITU', city: 'Itu',            prestige: 50 },
          { id: 'bra-2-7',  name: 'Novorizontino',     shortName: 'NOV', city: 'Novo Horizonte', prestige: 52 },
          { id: 'bra-2-8',  name: 'Sport Recife',      shortName: 'SPO', city: 'Recife',         prestige: 68 },
          { id: 'bra-2-9',  name: 'CRB',               shortName: 'CRB', city: 'Maceió',         prestige: 55 },
          { id: 'bra-2-10', name: 'Tombense',          shortName: 'TOM', city: 'Tombos',         prestige: 48 },
        ],
      },
      {
        level: 3,
        name: 'Série C',
        teams: [
          { id: 'bra-3-1',  name: 'ABC',               shortName: 'ABC', city: 'Natal',          prestige: 44 },
          { id: 'bra-3-2',  name: 'Ferroviária',       shortName: 'FER', city: 'Araraquara',     prestige: 42 },
          { id: 'bra-3-3',  name: 'Paysandu',          shortName: 'PAY', city: 'Belém',          prestige: 46 },
          { id: 'bra-3-4',  name: 'Remo',              shortName: 'REM', city: 'Belém',          prestige: 44 },
          { id: 'bra-3-5',  name: 'Botafogo-PB',       shortName: 'BPB', city: 'João Pessoa',    prestige: 40 },
          { id: 'bra-3-6',  name: 'Confiança',         shortName: 'CON', city: 'Aracaju',        prestige: 38 },
          { id: 'bra-3-7',  name: 'Floresta',          shortName: 'FLO', city: 'Fortaleza',      prestige: 35 },
          { id: 'bra-3-8',  name: 'Altos',             shortName: 'ALT', city: 'Teresina',       prestige: 34 },
          { id: 'bra-3-9',  name: 'Manaus',            shortName: 'MAN', city: 'Manaus',         prestige: 33 },
          { id: 'bra-3-10', name: 'Brusque',           shortName: 'BRU', city: 'Brusque',        prestige: 36 },
        ],
      },
      {
        level: 4,
        name: 'Série D',
        teams: [
          { id: 'bra-4-1',  name: 'Caxias do Sul',     shortName: 'CAX', city: 'Caxias do Sul',  prestige: 29 },
          { id: 'bra-4-2',  name: 'São Bento',         shortName: 'SBE', city: 'Sorocaba',       prestige: 26 },
          { id: 'bra-4-3',  name: 'Portuguesa (SP)',   shortName: 'POR', city: 'São Paulo',      prestige: 28 },
          { id: 'bra-4-4',  name: 'Baré',              shortName: 'BAR', city: 'Boa Vista',      prestige: 20 },
          { id: 'bra-4-5',  name: 'Rio Branco (AC)',   shortName: 'RBR', city: 'Rio Branco',     prestige: 21 },
          { id: 'bra-4-6',  name: 'Real Noroeste',     shortName: 'RNO', city: 'Colatina',       prestige: 19 },
          { id: 'bra-4-7',  name: 'Cianorte',          shortName: 'CIA', city: 'Cianorte',       prestige: 22 },
          { id: 'bra-4-8',  name: 'Operário-MT',       shortName: 'OPE', city: 'Várzea Grande',  prestige: 20 },
          { id: 'bra-4-9',  name: 'Gama',              shortName: 'GAM', city: 'Brasília',       prestige: 24 },
          { id: 'bra-4-10', name: 'Moto Club',         shortName: 'MOT', city: 'São Luís',       prestige: 22 },
        ],
      },
    ],
  },

  // ─────────────── ESPAÑA ───────────────
  {
    id: 'esp',
    name: 'Liga Española',
    country: 'España',
    flag: '🇪🇸',
    divisions: [
      {
        level: 1,
        name: 'La Liga',
        teams: [
          { id: 'esp-1-1',  name: 'Real Madrid',       shortName: 'RMA', city: 'Madrid',         prestige: 99 },
          { id: 'esp-1-2',  name: 'FC Barcelona',      shortName: 'BAR', city: 'Barcelona',      prestige: 98 },
          { id: 'esp-1-3',  name: 'Atlético Madrid',   shortName: 'ATM', city: 'Madrid',         prestige: 94 },
          { id: 'esp-1-4',  name: 'Sevilla FC',        shortName: 'SEV', city: 'Sevilla',        prestige: 88 },
          { id: 'esp-1-5',  name: 'Real Betis',        shortName: 'BET', city: 'Sevilla',        prestige: 82 },
          { id: 'esp-1-6',  name: 'Athletic Club',     shortName: 'ATH', city: 'Bilbao',         prestige: 84 },
          { id: 'esp-1-7',  name: 'Real Sociedad',     shortName: 'RSO', city: 'San Sebastián',  prestige: 83 },
          { id: 'esp-1-8',  name: 'Villarreal',        shortName: 'VIL', city: 'Villarreal',     prestige: 82 },
          { id: 'esp-1-9',  name: 'Valencia CF',       shortName: 'VAL', city: 'Valencia',       prestige: 80 },
          { id: 'esp-1-10', name: 'Celta de Vigo',     shortName: 'CEL', city: 'Vigo',           prestige: 76 },
        ],
      },
      {
        level: 2,
        name: 'Segunda División',
        teams: [
          { id: 'esp-2-1',  name: 'Espanyol',          shortName: 'ESP', city: 'Barcelona',      prestige: 72 },
          { id: 'esp-2-2',  name: 'Racing Santander',  shortName: 'RAC', city: 'Santander',      prestige: 64 },
          { id: 'esp-2-3',  name: 'Deportivo LC',      shortName: 'DEP', city: 'La Coruña',      prestige: 70 },
          { id: 'esp-2-4',  name: 'Levante',           shortName: 'LEV', city: 'Valencia',       prestige: 68 },
          { id: 'esp-2-5',  name: 'Málaga CF',         shortName: 'MAL', city: 'Málaga',         prestige: 69 },
          { id: 'esp-2-6',  name: 'SD Huesca',         shortName: 'HUE', city: 'Huesca',         prestige: 60 },
          { id: 'esp-2-7',  name: 'Eibar',             shortName: 'EIB', city: 'Eibar',          prestige: 62 },
          { id: 'esp-2-8',  name: 'Real Oviedo',       shortName: 'OVI', city: 'Oviedo',         prestige: 61 },
          { id: 'esp-2-9',  name: 'CD Tenerife',       shortName: 'TEN', city: 'Santa Cruz',     prestige: 63 },
          { id: 'esp-2-10', name: 'UD Las Palmas',     shortName: 'LPL', city: 'Las Palmas',     prestige: 65 },
        ],
      },
      {
        level: 3,
        name: 'Primera Federación',
        teams: [
          { id: 'esp-3-1',  name: 'Real Madrid Castilla', shortName: 'RMC', city: 'Madrid',      prestige: 55 },
          { id: 'esp-3-2',  name: 'Barcelona B',           shortName: 'BCB', city: 'Barcelona',   prestige: 54 },
          { id: 'esp-3-3',  name: 'Atlético Madrid B',     shortName: 'ATB', city: 'Madrid',      prestige: 52 },
          { id: 'esp-3-4',  name: 'Cornellà',              shortName: 'COR', city: 'Cornellà',    prestige: 44 },
          { id: 'esp-3-5',  name: 'Real Unión',            shortName: 'RUN', city: 'Irún',        prestige: 42 },
          { id: 'esp-3-6',  name: 'Badajoz CF',            shortName: 'BAD', city: 'Badajoz',     prestige: 43 },
          { id: 'esp-3-7',  name: 'CF Intercity',          shortName: 'ICI', city: 'Alicante',    prestige: 40 },
          { id: 'esp-3-8',  name: 'Deportivo Aragón',      shortName: 'DAR', city: 'Zaragoza',    prestige: 38 },
          { id: 'esp-3-9',  name: 'Sestao River',          shortName: 'SES', city: 'Sestao',      prestige: 39 },
          { id: 'esp-3-10', name: 'Zamora CF',             shortName: 'ZAM', city: 'Zamora',      prestige: 37 },
        ],
      },
      {
        level: 4,
        name: 'Segunda Federación',
        teams: [
          { id: 'esp-4-1',  name: 'Algeciras CF',      shortName: 'ALG', city: 'Algeciras',      prestige: 30 },
          { id: 'esp-4-2',  name: 'UD Llanera',        shortName: 'LLA', city: 'Llanera',        prestige: 25 },
          { id: 'esp-4-3',  name: 'Rayo Majadahonda',  shortName: 'RMA', city: 'Majadahonda',    prestige: 28 },
          { id: 'esp-4-4',  name: 'UCAM Murcia',       shortName: 'UCM', city: 'Murcia',         prestige: 27 },
          { id: 'esp-4-5',  name: 'Peña Sport FC',     shortName: 'PSP', city: 'Tafalla',        prestige: 22 },
          { id: 'esp-4-6',  name: 'Guijuelo',          shortName: 'GUI', city: 'Guijuelo',       prestige: 21 },
          { id: 'esp-4-7',  name: 'Arenteiro',         shortName: 'ARE', city: 'Carballiño',     prestige: 20 },
          { id: 'esp-4-8',  name: 'Marino de Luanco',  shortName: 'MAR', city: 'Luanco',         prestige: 19 },
          { id: 'esp-4-9',  name: 'Barco CF',          shortName: 'BAR', city: 'O Barco',        prestige: 18 },
          { id: 'esp-4-10', name: 'CD Móstoles',       shortName: 'MOS', city: 'Móstoles',       prestige: 20 },
        ],
      },
    ],
  },

  // ─────────────── ALEMANIA ───────────────
  {
    id: 'ger',
    name: 'Liga Alemana',
    country: 'Alemania',
    flag: '🇩🇪',
    divisions: [
      {
        level: 1,
        name: 'Bundesliga',
        teams: [
          { id: 'ger-1-1',  name: 'Bayern München',    shortName: 'BAY', city: 'Múnich',         prestige: 98 },
          { id: 'ger-1-2',  name: 'Borussia Dortmund', shortName: 'BVB', city: 'Dortmund',       prestige: 92 },
          { id: 'ger-1-3',  name: 'Bayer Leverkusen',  shortName: 'B04', city: 'Leverkusen',     prestige: 88 },
          { id: 'ger-1-4',  name: 'RB Leipzig',        shortName: 'RBL', city: 'Leipzig',        prestige: 87 },
          { id: 'ger-1-5',  name: 'Eintracht Frankfurt', shortName: 'EIN', city: 'Frankfurt',    prestige: 84 },
          { id: 'ger-1-6',  name: 'VfL Wolfsburg',     shortName: 'WOB', city: 'Wolfsburgo',     prestige: 80 },
          { id: 'ger-1-7',  name: 'Borussia M\'gladbach', shortName: 'BMG', city: 'Mönchengladbach', prestige: 81 },
          { id: 'ger-1-8',  name: 'SC Freiburg',       shortName: 'SCF', city: 'Friburgo',       prestige: 78 },
          { id: 'ger-1-9',  name: 'Union Berlin',      shortName: 'FCU', city: 'Berlín',         prestige: 76 },
          { id: 'ger-1-10', name: 'TSG Hoffenheim',    shortName: 'TSG', city: 'Sinsheim',       prestige: 75 },
        ],
      },
      {
        level: 2,
        name: '2. Bundesliga',
        teams: [
          { id: 'ger-2-1',  name: 'Hamburger SV',      shortName: 'HSV', city: 'Hamburgo',       prestige: 74 },
          { id: 'ger-2-2',  name: 'Werder Bremen',     shortName: 'SVW', city: 'Bremen',         prestige: 75 },
          { id: 'ger-2-3',  name: 'Hertha BSC',        shortName: 'BSC', city: 'Berlín',         prestige: 72 },
          { id: 'ger-2-4',  name: 'Schalke 04',        shortName: 'S04', city: 'Gelsenkirchen',  prestige: 73 },
          { id: 'ger-2-5',  name: 'FC St. Pauli',      shortName: 'STP', city: 'Hamburgo',       prestige: 66 },
          { id: 'ger-2-6',  name: 'Fortuna Düsseldorf', shortName: 'F95', city: 'Düsseldorf',   prestige: 65 },
          { id: 'ger-2-7',  name: 'Hannover 96',       shortName: 'H96', city: 'Hannover',       prestige: 67 },
          { id: 'ger-2-8',  name: 'Greuther Fürth',    shortName: 'SGF', city: 'Fürth',          prestige: 60 },
          { id: 'ger-2-9',  name: 'VfL Osnabrück',     shortName: 'VFO', city: 'Osnabrück',      prestige: 52 },
          { id: 'ger-2-10', name: 'Eintracht Braunschweig', shortName: 'EBS', city: 'Braunschweig', prestige: 54 },
        ],
      },
      {
        level: 3,
        name: '3. Liga',
        teams: [
          { id: 'ger-3-1',  name: 'Dynamo Dresden',    shortName: 'SGD', city: 'Dresde',         prestige: 50 },
          { id: 'ger-3-2',  name: 'Hansa Rostock',     shortName: 'FCH', city: 'Rostock',        prestige: 48 },
          { id: 'ger-3-3',  name: 'TSV 1860 München',  shortName: 'TSV', city: 'Múnich',         prestige: 49 },
          { id: 'ger-3-4',  name: 'VfB Oldenburg',     shortName: 'VFB', city: 'Oldenburg',      prestige: 42 },
          { id: 'ger-3-5',  name: 'Hallescher FC',     shortName: 'HFC', city: 'Halle',          prestige: 40 },
          { id: 'ger-3-6',  name: 'Rot-Weiss Essen',   shortName: 'RWE', city: 'Essen',          prestige: 44 },
          { id: 'ger-3-7',  name: 'Erzgebirge Aue',    shortName: 'AUE', city: 'Aue',            prestige: 41 },
          { id: 'ger-3-8',  name: 'FSV Zwickau',       shortName: 'FSV', city: 'Zwickau',        prestige: 38 },
          { id: 'ger-3-9',  name: 'SV Wehen Wiesbaden', shortName: 'SVW', city: 'Wiesbaden',     prestige: 39 },
          { id: 'ger-3-10', name: 'Viktoria Köln',     shortName: 'VIK', city: 'Colonia',        prestige: 37 },
        ],
      },
      {
        level: 4,
        name: 'Regionalliga',
        teams: [
          { id: 'ger-4-1',  name: 'SC Verl',           shortName: 'SCV', city: 'Verl',           prestige: 28 },
          { id: 'ger-4-2',  name: 'Preussen Münster',  shortName: 'SCM', city: 'Münster',        prestige: 30 },
          { id: 'ger-4-3',  name: 'FC Homburg',        shortName: 'FCH', city: 'Homburg',        prestige: 27 },
          { id: 'ger-4-4',  name: 'Teutonia Hamburg',  shortName: 'TEU', city: 'Hamburgo',       prestige: 24 },
          { id: 'ger-4-5',  name: 'VfR Aalen',         shortName: 'VFR', city: 'Aalen',          prestige: 22 },
          { id: 'ger-4-6',  name: 'SV Elversberg',     shortName: 'SVE', city: 'Spiesen',        prestige: 21 },
          { id: 'ger-4-7',  name: 'FC Energie Cottbus', shortName: 'FCE', city: 'Cottbus',       prestige: 26 },
          { id: 'ger-4-8',  name: 'Stuttgarter Kickers', shortName: 'STK', city: 'Stuttgart',    prestige: 23 },
          { id: 'ger-4-9',  name: 'FSV Frankfurt',     shortName: 'FSF', city: 'Frankfurt',      prestige: 20 },
          { id: 'ger-4-10', name: 'VFC Plauen',        shortName: 'VFP', city: 'Plauen',         prestige: 18 },
        ],
      },
    ],
  },

  // ─────────────── ITALIA ───────────────
  {
    id: 'ita',
    name: 'Liga Italiana',
    country: 'Italia',
    flag: '🇮🇹',
    divisions: [
      {
        level: 1,
        name: 'Serie A',
        teams: [
          { id: 'ita-1-1',  name: 'Juventus',          shortName: 'JUV', city: 'Turín',          prestige: 96 },
          { id: 'ita-1-2',  name: 'AC Milan',           shortName: 'MIL', city: 'Milán',          prestige: 95 },
          { id: 'ita-1-3',  name: 'Inter Milan',        shortName: 'INT', city: 'Milán',          prestige: 95 },
          { id: 'ita-1-4',  name: 'AS Roma',            shortName: 'ROM', city: 'Roma',           prestige: 90 },
          { id: 'ita-1-5',  name: 'SS Lazio',           shortName: 'LAZ', city: 'Roma',           prestige: 87 },
          { id: 'ita-1-6',  name: 'SSC Napoli',         shortName: 'NAP', city: 'Nápoles',        prestige: 91 },
          { id: 'ita-1-7',  name: 'Atalanta',           shortName: 'ATA', city: 'Bérgamo',        prestige: 87 },
          { id: 'ita-1-8',  name: 'Fiorentina',         shortName: 'FIO', city: 'Florencia',      prestige: 83 },
          { id: 'ita-1-9',  name: 'Torino FC',          shortName: 'TOR', city: 'Turín',          prestige: 78 },
          { id: 'ita-1-10', name: 'Bologna FC',         shortName: 'BOL', city: 'Bolonia',        prestige: 76 },
        ],
      },
      {
        level: 2,
        name: 'Serie B',
        teams: [
          { id: 'ita-2-1',  name: 'Sampdoria',          shortName: 'SAM', city: 'Génova',         prestige: 72 },
          { id: 'ita-2-2',  name: 'Parma',              shortName: 'PAR', city: 'Parma',          prestige: 70 },
          { id: 'ita-2-3',  name: 'Genoa',              shortName: 'GEN', city: 'Génova',         prestige: 71 },
          { id: 'ita-2-4',  name: 'Palermo',            shortName: 'PAL', city: 'Palermo',        prestige: 68 },
          { id: 'ita-2-5',  name: 'Brescia',            shortName: 'BRE', city: 'Brescia',        prestige: 65 },
          { id: 'ita-2-6',  name: 'Pisa SC',            shortName: 'PIS', city: 'Pisa',           prestige: 62 },
          { id: 'ita-2-7',  name: 'Venezia FC',         shortName: 'VEN', city: 'Venecia',        prestige: 64 },
          { id: 'ita-2-8',  name: 'Catanzaro',          shortName: 'CAT', city: 'Catanzaro',      prestige: 58 },
          { id: 'ita-2-9',  name: 'FeralpiSalò',        shortName: 'FER', city: 'Salò',           prestige: 52 },
          { id: 'ita-2-10', name: 'Cosenza',            shortName: 'COS', city: 'Cosenza',        prestige: 54 },
        ],
      },
      {
        level: 3,
        name: 'Serie C',
        teams: [
          { id: 'ita-3-1',  name: 'Triestina',          shortName: 'TRI', city: 'Trieste',        prestige: 47 },
          { id: 'ita-3-2',  name: 'Carrarese',          shortName: 'CAR', city: 'Carrara',        prestige: 44 },
          { id: 'ita-3-3',  name: 'Modena',             shortName: 'MOD', city: 'Módena',         prestige: 48 },
          { id: 'ita-3-4',  name: 'Vicenza',            shortName: 'VIC', city: 'Vicenza',        prestige: 46 },
          { id: 'ita-3-5',  name: 'Potenza',            shortName: 'POT', city: 'Potenza',        prestige: 40 },
          { id: 'ita-3-6',  name: 'Crotone',            shortName: 'CRO', city: 'Crotone',        prestige: 42 },
          { id: 'ita-3-7',  name: 'Foggia',             shortName: 'FOG', city: 'Foggia',         prestige: 43 },
          { id: 'ita-3-8',  name: 'Juve Stabia',        shortName: 'JVS', city: 'Castellammare', prestige: 39 },
          { id: 'ita-3-9',  name: 'Torres',             shortName: 'TOR', city: 'Sássari',        prestige: 37 },
          { id: 'ita-3-10', name: 'Recanatese',         shortName: 'REC', city: 'Recanati',       prestige: 35 },
        ],
      },
      {
        level: 4,
        name: 'Serie D',
        teams: [
          { id: 'ita-4-1',  name: 'Pianese',            shortName: 'PIA', city: 'Piancastagnaio', prestige: 28 },
          { id: 'ita-4-2',  name: 'Bra',                shortName: 'BRA', city: 'Bra',            prestige: 24 },
          { id: 'ita-4-3',  name: 'Campobasso',         shortName: 'CAM', city: 'Campobasso',     prestige: 26 },
          { id: 'ita-4-4',  name: 'Lupa Roma',          shortName: 'LUP', city: 'Roma',           prestige: 22 },
          { id: 'ita-4-5',  name: 'Nola 1925',          shortName: 'NOL', city: 'Nola',           prestige: 20 },
          { id: 'ita-4-6',  name: 'Acireale',           shortName: 'ACI', city: 'Acireale',       prestige: 19 },
          { id: 'ita-4-7',  name: 'Trapani',            shortName: 'TRA', city: 'Trápani',        prestige: 21 },
          { id: 'ita-4-8',  name: 'Licata',             shortName: 'LIC', city: 'Licata',         prestige: 18 },
          { id: 'ita-4-9',  name: 'Portici',            shortName: 'POR', city: 'Portici',        prestige: 17 },
          { id: 'ita-4-10', name: 'Gladiator',          shortName: 'GLA', city: 'Capua',          prestige: 16 },
        ],
      },
    ],
  },

  // ─────────────── FRANCE ───────────────
  {
    id: 'fra',
    name: 'Liga Francesa',
    country: 'Francia',
    flag: '🇫🇷',
    divisions: [
      {
        level: 1,
        name: 'Ligue 1',
        teams: [
          { id: 'fra-1-1',  name: 'Paris Saint-Germain', shortName: 'PSG', city: 'París',        prestige: 97 },
          { id: 'fra-1-2',  name: 'Olympique Marseille', shortName: 'OM',  city: 'Marsella',     prestige: 88 },
          { id: 'fra-1-3',  name: 'Olympique Lyonnais',  shortName: 'OL',  city: 'Lyon',         prestige: 87 },
          { id: 'fra-1-4',  name: 'AS Monaco',           shortName: 'ASM', city: 'Mónaco',       prestige: 85 },
          { id: 'fra-1-5',  name: 'RC Lens',             shortName: 'RCL', city: 'Lens',         prestige: 76 },
          { id: 'fra-1-6',  name: 'LOSC Lille',          shortName: 'LIL', city: 'Lille',        prestige: 82 },
          { id: 'fra-1-7',  name: 'OGC Nice',            shortName: 'NIC', city: 'Niza',         prestige: 78 },
          { id: 'fra-1-8',  name: 'Stade Rennais',       shortName: 'REN', city: 'Rennes',       prestige: 77 },
          { id: 'fra-1-9',  name: 'Montpellier HSC',     shortName: 'MON', city: 'Montpellier',  prestige: 72 },
          { id: 'fra-1-10', name: 'Stade Brestois',      shortName: 'BRE', city: 'Brest',        prestige: 70 },
        ],
      },
      {
        level: 2,
        name: 'Ligue 2',
        teams: [
          { id: 'fra-2-1',  name: 'Girondins Bordeaux',  shortName: 'BOR', city: 'Burdeos',      prestige: 71 },
          { id: 'fra-2-2',  name: 'FC Metz',             shortName: 'FCM', city: 'Metz',         prestige: 66 },
          { id: 'fra-2-3',  name: 'SC Bastia',           shortName: 'SCB', city: 'Bastia',       prestige: 63 },
          { id: 'fra-2-4',  name: 'Grenoble Foot',       shortName: 'GRE', city: 'Grenoble',     prestige: 58 },
          { id: 'fra-2-5',  name: 'FC Annecy',           shortName: 'ANN', city: 'Annecy',       prestige: 52 },
          { id: 'fra-2-6',  name: 'Rodez AF',            shortName: 'ROD', city: 'Rodez',        prestige: 50 },
          { id: 'fra-2-7',  name: 'Pau FC',              shortName: 'PAU', city: 'Pau',          prestige: 48 },
          { id: 'fra-2-8',  name: 'Dunkerque',           shortName: 'USL', city: 'Dunkerque',    prestige: 47 },
          { id: 'fra-2-9',  name: 'Caen',                shortName: 'SMC', city: 'Caen',         prestige: 62 },
          { id: 'fra-2-10', name: 'Le Havre AC',         shortName: 'LHA', city: 'El Havre',     prestige: 64 },
        ],
      },
      {
        level: 3,
        name: 'National 1',
        teams: [
          { id: 'fra-3-1',  name: 'Valenciennes',        shortName: 'VAF', city: 'Valenciennes', prestige: 46 },
          { id: 'fra-3-2',  name: 'Tours FC',            shortName: 'TFC', city: 'Tours',        prestige: 43 },
          { id: 'fra-3-3',  name: 'Marignane-Gignac',    shortName: 'MGC', city: 'Marignane',    prestige: 38 },
          { id: 'fra-3-4',  name: 'Lyon-Duchère',        shortName: 'LYD', city: 'Lyon',         prestige: 37 },
          { id: 'fra-3-5',  name: 'Villefranche',        shortName: 'BVF', city: 'Villefranche', prestige: 35 },
          { id: 'fra-3-6',  name: 'Béziers',             shortName: 'ASB', city: 'Béziers',      prestige: 36 },
          { id: 'fra-3-7',  name: 'Saint-Malo',          shortName: 'ASM', city: 'Saint-Malo',   prestige: 33 },
          { id: 'fra-3-8',  name: 'ASOA Valence',        shortName: 'AOV', city: 'Valence',      prestige: 31 },
          { id: 'fra-3-9',  name: 'Bergerac Périgord',   shortName: 'BER', city: 'Bergerac',     prestige: 29 },
          { id: 'fra-3-10', name: 'US Concarneau',       shortName: 'USC', city: 'Concarneau',   prestige: 30 },
        ],
      },
      {
        level: 4,
        name: 'National 2',
        teams: [
          { id: 'fra-4-1',  name: 'Stade Lavallois',     shortName: 'SLA', city: 'Laval',        prestige: 26 },
          { id: 'fra-4-2',  name: 'SC Feignies-Aulnoye', shortName: 'SFA', city: 'Feignies',     prestige: 22 },
          { id: 'fra-4-3',  name: 'AS Poissy',           shortName: 'POS', city: 'Poissy',       prestige: 20 },
          { id: 'fra-4-4',  name: 'Avranches',           shortName: 'MSM', city: 'Avranches',    prestige: 21 },
          { id: 'fra-4-5',  name: 'Stade Briochin',      shortName: 'SAB', city: 'Saint-Brieuc', prestige: 19 },
          { id: 'fra-4-6',  name: 'Villemomble Sports',  shortName: 'VSP', city: 'Villemomble',  prestige: 18 },
          { id: 'fra-4-7',  name: 'AS Cantona',          shortName: 'CAN', city: 'Cantona',      prestige: 17 },
          { id: 'fra-4-8',  name: 'JSA Bordeaux',        shortName: 'JSB', city: 'Burdeos',      prestige: 16 },
          { id: 'fra-4-9',  name: 'FC Bobigny',          shortName: 'BOB', city: 'Bobigny',      prestige: 15 },
          { id: 'fra-4-10', name: 'Lusitanos Saint-Maur', shortName: 'LSM', city: 'Saint-Maur',  prestige: 14 },
        ],
      },
    ],
  },
];

/**
 * Retorna un listado plano de todos los equipos de una liga y división específica.
 */
export function getTeamsByLeagueAndDivision(leagueId, divisionLevel) {
  const league = LEAGUES.find((l) => l.id === leagueId);
  if (!league) return [];
  const division = league.divisions.find((d) => d.level === divisionLevel);
  return division ? division.teams : [];
}

/**
 * Retorna la lista de divisiones disponibles para una liga.
 */
export function getDivisionOptions(leagueId) {
  const league = LEAGUES.find((l) => l.id === leagueId);
  if (!league) return [];
  return league.divisions.map((d) => ({ value: d.level, label: d.name }));
}
