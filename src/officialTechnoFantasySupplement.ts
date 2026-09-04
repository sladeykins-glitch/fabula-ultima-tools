import type { Monster } from './rules'

const normal = { physical:'Normal', air:'Normal', bolt:'Normal', dark:'Normal', earth:'Normal', fire:'Normal', ice:'Normal', light:'Normal', poison:'Normal' } as const
const a=(name:string,formula:string,damageType:string,effect?:string)=>({name,formula,damageType,effect})
const s=(name:string,summary:string)=>({name,summary})
const sp=(name:string,mp:string,target:string,effect:string,duration='Instantaneous')=>({name,mp,target,duration,effect})

export const officialTechnoFantasySupplement: Monster[] = [
  {
    id:'official-techno-syntech-cop', name:'SynTech Cop', source:'Official', level:10, rank:'Soldier', soldierEquivalent:1, species:'Humanoid',
    traits:['armored','cowardly','follower','resentful'], attributes:{dex:8,ins:8,mig:8,wlp:8}, hp:60, crisis:30, mp:50, initiative:6,
    defense:10, magicDefense:8, accuracyBonus:1, magicBonus:1, levelDamageBonus:0, turnsPerRound:1, skillBudget:0,
    affinities:{...normal,air:'Resistant',earth:'Resistant',ice:'Vulnerable'} as Monster['affinities'],
    attacks:[a('Baton','MIG + MIG +1','physical','HR + 6 damage.'),a('Taser','DEX + INS +1','bolt','HR + 5 damage and target suffers weak. This attack cannot be used with Commissioner Vyne’s Charge! spell.')],
    skills:[
      s('Frustration','When the SynTech cop suffers damage, they also suffer enraged. While enraged they gain Resistance to all damage types except ice.'),
      s('Outburst','When enraged and Baton misses all targets without a fumble, the failure becomes a success; then recover from enraged and treat HR as 0 for damage.'),
      s('Yes Ma’am!','When performing a free attack thanks to Commissioner Vyne’s Charge!, deal extra damage equal to 5 + the number of status effects on the target.'),
      s('Equipment','Baton (same as iron hammer); riot armor (same as brigandine).')
    ], spells:[], notes:['Official profile - Fabula Ultima Atlas: Techno Fantasy.','Printed page 187.'], combatStyle:'Brute'
  },
  {
    id:'official-techno-surveillance-drone', name:'Surveillance Drone', source:'Official', level:10, rank:'Soldier', soldierEquivalent:1, species:'Construct',
    traits:['electronic','light','remote controlled','small'], attributes:{dex:8,ins:10,mig:6,wlp:8}, hp:50, crisis:25, mp:60, initiative:10,
    defense:9, magicDefense:12, accuracyBonus:1, magicBonus:1, levelDamageBonus:0, turnsPerRound:1, skillBudget:0,
    affinities:{...normal,air:'Vulnerable',bolt:'Vulnerable',earth:'Resistant',poison:'Immune'} as Monster['affinities'],
    attacks:[a('Suppressive Fire','DEX + INS +1','physical','HR + 5 damage and target suffers slow.')],
    skills:[s('Construct','Immune to poisoned.'),s('Flying','Can fly.')],
    spells:[sp('Painting Laser','10','One creature','Until this spell ends, when the target suffers damage, they suffer 5 extra damage and that damage ignores Resistances. Once that happens, this spell ends.','Scene')],
    notes:['Official profile - Fabula Ultima Atlas: Techno Fantasy.','Printed page 188.'], combatStyle:'Support'
  }
]
