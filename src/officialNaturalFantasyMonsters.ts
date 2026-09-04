import type { Monster, Species, Rank } from './rules'

const normal = { physical:'Normal', air:'Normal', bolt:'Normal', dark:'Normal', earth:'Normal', fire:'Normal', ice:'Normal', light:'Normal', poison:'Normal' } as const
const a=(name:string,formula:string,damageType:string,effect?:string)=>({name,formula,damageType,effect})
const s=(name:string,summary:string)=>({name,summary})
const sp=(name:string,mp:string,target:string,effect:string,duration='Instantaneous')=>({name,mp,target,duration,effect})
const m=(id:string,name:string,level:number,rank:Rank,eq:number,species:Species,traits:string[],attrs:Monster['attributes'],hp:number,mp:number,initiative:number,defense:number,magicDefense:number,attacks:Monster['attacks'],skills:Monster['skills']=[],spells:Monster['spells']=[],aff:Partial<Monster['affinities']>={},notes:string[]=[]):Monster=>({
  id:`official-natural-${id}`,name,source:'Official',level,rank,soldierEquivalent:eq,species,traits,attributes:attrs,
  hp,crisis:Math.floor(hp/2),mp,initiative,defense,magicDefense,accuracyBonus:Math.floor(level/10),magicBonus:Math.floor(level/10),levelDamageBonus:level>=40?10:level>=20?5:0,turnsPerRound:eq,skillBudget:0,
  affinities:{...normal,...aff} as Monster['affinities'],attacks,skills,spells,notes:['Official profile - Fabula Ultima Atlas: Natural Fantasy.',...notes],combatStyle:'Mixed'
})

export const officialNaturalFantasyMonsters: Monster[] = [
  m('tonitranea-abdomen','Tonitranea Rex - Abdomen',5,'Soldier',1,'Monster',['bulky','electrostatic','spiky','tough'],{dex:8,ins:6,mig:10,wlp:8},60,55,7,8,8,[
    a('Trampling Slam','DEX + MIG','physical','HR + 5 damage. If electrified, +10 damage and damage becomes bolt; multi (2) while the Thorax is dangling.')
  ],[
    s('Electrostatic Spines','After a melee hit, if electrified, deal 5 bolt damage to the attacker.'),
    s('Grounding','Earth damage ends the electrified state.'),
    s('Limb','Immune to dazed, enraged and shaken.')
  ],[sp('Paralyzing Silk','20','Special','Every enemy the Abdomen can see suffers slow.')],{air:'Resistant',bolt:'Immune',earth:'Vulnerable',fire:'Vulnerable',poison:'Resistant'},['Printed page 178. One of three coordinated Tonitranea Rex body-part profiles.']),

  m('tonitranea-head','Tonitranea Rex - Head',5,'Soldier',1,'Monster',['frail','lucifuge','poisonous','protected'],{dex:8,ins:10,mig:6,wlp:8},40,45,9,8,8,[a('Toxic Spit','DEX + MIG +3','poison','HR + 10 damage.')],[s('Wall of Legs','Invisible to enemies while the Thorax is not dangling.')],[],{physical:'Vulnerable',air:'Resistant',bolt:'Resistant',light:'Vulnerable',poison:'Immune'},['Printed page 178. One of three coordinated Tonitranea Rex body-part profiles.']),

  m('tonitranea-thorax','Tonitranea Rex - Thorax',5,'Champion',2,'Monster',['armored','coordinated','electrostatic','ravenous'],{dex:8,ins:8,mig:8,wlp:8},100,90,10,10,9,[a('Lightning Leg','DEX + MIG +3','bolt','HR + 5 damage; while dangling this ignores Resistance and has multi (2), but can only target two slow enemies.')],[
    s('Electrostatic Charge','Spend 10 MP to make the Abdomen electrified.'),
    s('Predator Ascent','Spend 10 MP to become dangling; while dangling no part can be targeted by melee attacks unless the attacker can reach flying creatures.'),
    s('Limb','Immune to dazed, enraged and shaken.'),
    s('Survival Instinct','In its lair, may spend 1 Ultima Point at round end to return defeated Head/Abdomen parts at Crisis HP and full MP.')
  ],[],{air:'Resistant',bolt:'Immune',earth:'Vulnerable',ice:'Vulnerable',poison:'Resistant'},['Printed page 179. Champion 2 body-part profile.']),

  m('node','Node',10,'Elite',2,'Humanoid',['determined','loyal','pragmatic','seaborn'],{dex:10,ins:6,mig:8,wlp:8},120,60,10,11,11,[
    a('Net Throw','DEX + MIG +4','physical','HR + 5 damage; multi (2).'),
    a("Hunter's Bow",'DEX + DEX +4','physical','HR + 8 damage; high tide: +5 damage against weak targets; low tide: target suffers slow.')
  ],[
    s('High Tide Style','At high tide, attacks treat the target Defense as equal to their current Might die size.'),
    s("I'll Avenge You!",'When Dylon reaches 0 HP, recover from all status effects, lose all Vulnerabilities, and the tide becomes high.'),
    s('Low Tide Speed','At low tide, damage from slow creatures is reduced by 5 before Affinities.')
  ],[sp('Hunting Horn','10 x T','Up to three creatures','Targets gain +1 to Accuracy Checks.','Scene')],{bolt:'Resistant',earth:'Vulnerable',fire:'Resistant',ice:'Vulnerable'},['Printed page 184. Uses the shared high-tide / low-tide battle state with Dylon.']),

  m('dylon','Dylon',10,'Elite',2,'Beast',['imposing','protective','seaborn','staunch'],{dex:6,ins:8,mig:10,wlp:8},140,60,9,12,11,[a('Sea Fin','INS + MIG +1','ice','HR + 5 damage; high tide: target suffers weak; low tide: target cannot see Node until Dylon uses Sea Fin again.')],[
    s('Coordinated Action','Spend 10 MP to make a free Sea Fin attack with HR treated as 0; high tide lets Node make a free Hunter’s Bow attack, while low tide lets Node recover 10 HP.'),
    s('High Tide Strength','At high tide, all damage dealt by Dylon ignores Resistances.'),
    s("I'll Avenge You!",'When Node reaches 0 HP, recover from all status effects, lose all Vulnerabilities, and the tide becomes high.'),
    s('Low Tide Tenacity','At low tide, Resistant to physical damage.')
  ],[sp('Rock Toss','5','One creature','HR + 10 earth damage.')],{bolt:'Vulnerable',earth:'Resistant',fire:'Vulnerable',ice:'Resistant'},['Printed page 185. Uses the shared high-tide / low-tide battle state with Node.']),

  m('brightvale-back','Back of Brightvale',20,'Champion',3,'Construct',['floating','infested','lengthy','rocky'],{dex:8,ins:8,mig:12,wlp:6},300,100,11,8,8,[a('Unstable Terrain','MIG + MIG +2','earth','HR + 10 damage; multi (2).')],[
    s('Sandy Dive','Spend 20 MP; enemies make a Group Check INS + MIG DL 10. On failure, each suffers 15 earth damage and shaken.'),
    s('Stolen Strength','Drain 20 HP from each Will-o-Wisp on the scene and recover 20 MP per Wisp drained.'),
    s('Construct','Immune to poisoned.'),
    s('Sand and Dust','At the end of each turn while in Crisis, lose 10 HP; if this reduces it to 0, all enemies suffer 20 physical damage.'),
    s('Without Conscience','Immune to dazed, enraged and shaken.')
  ],[sp('Compact Terrain','5','Self','Gain Resistance to physical damage until Crisis.','Scene'),sp('Silent Call','10 x T','Up to two creatures','Each target may perform a free weapon/basic attack with HR treated as 0.')],{air:'Vulnerable',bolt:'Immune',dark:'Resistant',earth:'Immune',fire:'Resistant',ice:'Vulnerable',poison:'Immune'},['Printed page 188. Brightvale phase 1 profile.']),

  m('will-o-wisp','Will-o-Wisp',20,'Soldier',1,'Undead',['empty','faint','incomplete','whispering'],{dex:12,ins:8,mig:6,wlp:8},70,70,9,8,8,[a('Pale Flame','DEX + WLP +2','fire','HR + 10 damage.')],[
    s('Embrace the End','If at least two Will-o-Wisps are present, Grave Whisper deals +5 damage.'),
    s('Feeble Flame','After suffering damage it is Vulnerable to, lose all MP and suffer dazed, shaken, slow and weak.'),
    s('Flying','Can fly.'),
    s('Parasitic Flame','When enemies recover MP, they recover half; each Will-o-Wisp recovers 999 MP, triggering once if multiple Wisps are present.'),
    s('Undead','Immune to poisoned; HP recovery may harm it.')
  ],[sp('Grave Whisper','5','One creature','INS + WLP +5; HR + 15 dark damage.')],{physical:'Resistant',air:'Vulnerable',bolt:'Resistant',dark:'Immune',earth:'Resistant',fire:'Resistant',ice:'Vulnerable',light:'Vulnerable',poison:'Immune'},['Printed page 189.']),

  m('funerary-lantern','Funerary Lantern',20,'Soldier',1,'Construct',['ancient','faint','frail','hypnotic'],{dex:8,ins:8,mig:6,wlp:12},70,90,8,8,8,[a('Dim Light','WLP + WLP +2','light','HR + 10 damage; multi (2).')],[s('Construct','Immune to poisoned.'),s('Quiet in the Dark','At 0 HP while lit, becomes extinguished and remains at 1 HP; while extinguished cannot regain/lose HP or act.')],[sp('Follow Me...','10','One creature','All damage dealt by the target becomes light and cannot change; ends after the target takes a turn.','Scene')],{dark:'Vulnerable',earth:'Resistant',ice:'Vulnerable',light:'Absorb',poison:'Immune'},['Printed page 190. Brightvale phase 2 support profile.']),

  m('brightvale-head','Head of Brightvale',20,'Champion',3,'Undead',['apathetic','empty','hypnotized','quiet'],{dex:8,ins:6,mig:8,wlp:12},240,180,10,8,8,[a('Gravesand Jaws','DEX + MIG +2','earth','HR + 10 damage; if the Funerary Lantern is extinguished, +5 damage.')],[
    s('Ancient Desires','Spend 20 MP: if Lantern extinguished, relight it at 35 HP; if lit, Lantern recovers 35 HP and makes a free Dim Light attack.'),
    s('Desperation','When harmed by HP recovery while the Lantern is extinguished, loses the full amount it would have recovered instead of half.'),
    s('Life Craving','When a PC invokes a Trait while Lantern is lit, recover 10 HP and that PC becomes feeble until Lantern is extinguished.'),
    s('Symbol of Attachment','While Lantern is lit, current HP cannot go below 1.'),
    s('Undead','Immune to poisoned; HP recovery may harm it.'),
    s('Unnatural Presence','At the start of its first turn each round, if no PC is shaken and Lantern is lit, all PCs become shaken.')
  ],[sp('Dust to Dust','10','One creature','MIG + WLP +5; HR + 20 earth damage and target suffers weak.')],{air:'Vulnerable',bolt:'Immune',dark:'Immune',earth:'Immune',ice:'Vulnerable',light:'Vulnerable',poison:'Immune'},['Printed page 191. Brightvale phase 2 main profile.']),

  m('titania-midday','Titania - Queen of Midday',30,'Champion',3,'Elemental',['ethereal','fickle','gracious','shimmering'],{dex:8,ins:10,mig:8,wlp:8},300,160,12,9,10,[a('Royal Fan','DEX + INS +3','air','HR + 10 damage and target suffers slow.')],[
    s('Fairy Decree','Declare Season of the Opposites, Mirror Mirror, or Law of the Fairies, then make a free Royal Fan attack.'),
    s('Radiant Bloom','Spend 20 MP to make all Sun Poppies bloom; if none are present, a new Sun Poppy enters and blooms.'),
    s('Aspect of the Queen','+3 to Opposed Checks concerning fairies or diplomacy.'),
    s('Dusk','At 0 HP, spend 1 Ultima Point to return next round as Queen of Midnight with two Moon Orchids; otherwise surrender.'),
    s('Elemental','Immune to poisoned.'),
    s('Weird Mind','At turn start recover from dazed/shaken and regain 10 MP.')
  ],[sp('Solar Mantle','10 x T','Up to three creatures','INS + WLP +3; HR + 20 light damage.')],{physical:'Resistant',air:'Immune',dark:'Vulnerable',earth:'Vulnerable',fire:'Immune',ice:'Vulnerable',light:'Absorb',poison:'Immune'},['Printed page 194.']),

  m('sun-poppy','Sun Poppy',30,'Soldier',1,'Elemental',['ephemeral','lazy','multicolored','shining'],{dex:8,ins:10,mig:8,wlp:8},100,70,9,9,10,[a('Diurnal Caress','DEX + WLP +6','light','HR + 10 damage; next light damage taken by the target this round deals +5 damage.')],[
    s('Sweet Oblivion','Use an action; each enemy the Sun Poppy can see loses 20 MP.'),
    s('Elemental','Immune to poisoned.'),
    s('Energized Awakening','At 0 HP, all enemies regain 30 MP.'),
    s('Kissed by the Sun','While in bloom and Titania is not in Crisis, loses Vulnerabilities to ice and dark.'),
    s('Withering Heat','After losing HP to a Vulnerable type or losing MP while in bloom, stops blooming.')
  ],[],{air:'Resistant',dark:'Vulnerable',fire:'Resistant',ice:'Vulnerable',light:'Immune',poison:'Immune'},['Printed page 195.']),

  m('titania-midnight','Titania - Queen of Midnight',30,'Champion',3,'Elemental',['brutal','merciless','mercurial','regal'],{dex:10,ins:8,mig:8,wlp:8},300,160,12,8,8,[a('Fairy Arrow','DEX + MIG +3','ice','HR + 15 damage.')],[
    s('Gaunt Bloom','Spend 20 MP to make all Moon Orchids bloom; if none are present, a new Moon Orchid enters and blooms.'),
    s('Wild Hunt','Declare Hound the Prey, Gathering Horn, or Thrill of the Hunt, then make a free Fairy Arrow attack.'),
    s('Aspect of the Huntress','+3 to Opposed Checks concerning swiftness, accuracy or giving chase.'),
    s('Dawn','At 0 HP, spend 1 Ultima Point to return next round as Queen of Midday with two Sun Poppies; otherwise surrender.'),
    s('Elemental','Immune to poisoned.'),
    s('Eternal Body','At turn start recover from slow/weak and regain 10 MP.')
  ],[sp('Lunar Blanket','10','One creature','INS + MIG +3; HR + 20 dark damage and target suffers weak.')],{physical:'Resistant',air:'Vulnerable',dark:'Absorb',earth:'Immune',fire:'Vulnerable',ice:'Immune',light:'Vulnerable',poison:'Immune'},['Printed page 196.']),

  m('moon-orchid','Moon Orchid',30,'Soldier',1,'Elemental',['ephemeral','frantic','lethal','pure'],{dex:10,ins:8,mig:8,wlp:8},100,70,9,10,9,[a('Nocturnal Laceration','DEX + MIG +6','dark','HR + 10 damage; while in bloom, +5 damage.')],[
    s('Rude Awakening','Spend 20 MP to deal 10 dark damage to every visible enemy.'),
    s('Elemental','Immune to poisoned.'),
    s('Ephemeral Beauty','While in bloom, becomes Vulnerable to physical damage.'),
    s('Fragile Frost','After losing HP to a Vulnerable type or losing MP while in bloom, stops blooming.'),
    s('Moon Kiss','While at least one Moon Orchid is in bloom, Titania loses Vulnerabilities to fire and light.')
  ],[],{air:'Vulnerable',dark:'Immune',earth:'Resistant',ice:'Resistant',light:'Vulnerable',poison:'Immune'},['Printed page 197.']),

  m('ashen-radande','Ashen Radande',40,'Soldier',1,'Plant',['merciless','poisoned','scorched','terrifying'],{dex:10,ins:12,mig:8,wlp:6},120,80,11,8,8,[a('Fan the Flames','DEX + MIG +4','fire','HR + 20 damage; if target was not coveted, this Radande loses 10 HP.')],[s('Harrowing Rage','While poisoned, all damage dealt ignores Immunities and Resistances.'),s('Plant','Immune to dazed, enraged and shaken.'),s('Trial by Fire','At 0 HP, PCs receive 1 Trial Point.')],[sp('Shared Torment','20','One creature','INS + WLP +7; both Radande and target suffer poisoned.')],{air:'Vulnerable',earth:'Resistant',fire:'Immune',ice:'Vulnerable',poison:'Resistant'},['Printed page 201.']),

  m('eldgren','Eldgren, the Ancient',40,'Champion',5,'Plant',['ashen','immense','resentful','tortured'],{dex:6,ins:8,mig:12,wlp:10},700,180,12,8,8,[
    a('Ashen Antlers','MIG + MIG +4','fire','HR + 20 damage; +5 while Eldgren bears a grudge; if it misses while bearing a grudge, Eldgren loses 30 HP.'),
    a('Toxic Despair','INS + MIG +4','poison','HR + 15 damage; multi (2); poisoned targets also suffer shaken and weak.')
  ],[
    s('Thousand-year Fury','Deal 30 typeless damage to the grudge target, +10 for each prior use this scene, then end the grudge.'),
    s('Ancestral Grudge','When an opponent causes HP loss, Eldgren bears a grudge toward them; recovering HP while bearing a grudge instead ends the grudge without healing.'),
    s('Misery','Immune to poisoned. While two or more creatures are poisoned, may treat DEF and M.DEF as 13.'),
    s('Plant','Immune to dazed, enraged and shaken.'),
    s('Suffering Exhale','First time entering Crisis, all creatures suffer poisoned.'),
    s('Tough Grudge','While bearing a grudge, Immune to all damage types except air and earth.')
  ],[sp('Rekindle the Embers','10 x T','Up to three creatures','MIG + WLP +4; targets suffer enraged.'),sp('Scorching Gaze','10','One creature','MIG + WLP +4; HR + 25 fire damage and target suffers shaken.')],{air:'Vulnerable',bolt:'Resistant',earth:'Vulnerable',fire:'Immune',ice:'Resistant',poison:'Absorb'},['Printed page 203. Eldgren phase 1 main profile.']),

  m('eldgren-heart','The Heart',40,'Champion',4,'Plant',['burning','desperate','millennia-old','resentful'],{dex:8,ins:10,mig:8,wlp:10},480,200,13,8,8,[a('Flame of Remembrance','INS + MIG +7','fire','HR + 15 damage; on even HR the Heart regains 20 HP, otherwise loses 20 HP.'),a('Avenging Miasma','INS + WLP +7','poison','HR + 15 damage; multi (2).')],[
    s('Ancestral Vitality','Spend 20 MP to end all Scene-duration spells and hex invocations affecting the Heart.'),
    s('Parasitic Despair','While not in Crisis, treated as having Normal Affinity to all damage types.'),
    s('Plant','Immune to dazed, enraged and shaken.')
  ],[sp('Ashen Breath','10','One creature','INS + WLP +4; HR + 25 fire damage.'),sp('Aura of Desperation','20','Special','Every creature able to see the Heart suffers shaken.'),sp('Parasite Grasp','30','Special','The Heart loses enough HP to enter Crisis, then deals poison damage equal to HP lost divided among all creatures present.')],{physical:'Absorb',air:'Absorb',bolt:'Absorb',dark:'Absorb',earth:'Absorb',fire:'Absorb',ice:'Absorb',light:'Absorb',poison:'Absorb'},['Printed page 205. Eldgren phase 3 profile; phase rule begins at 1 HP and is won by healing the Heart to 480 HP.'])
]
