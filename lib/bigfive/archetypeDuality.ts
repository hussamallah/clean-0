import type { GZProfile } from './types';

interface ArchetypeVitals {
  title: string;
  superpower: string;
  operation: string;
  kryptonite: string;
  drive: string;
}

const ARCHETYPE_VITALS: Record<string, ArchetypeVitals> = {
  sovereign: {
    title: "The Sovereign",
    superpower: "Commanding Order.",
    operation: "You lead with decisive authority, building systems and holding the line.",
    kryptonite: "Unpredictable people and disruptive change.",
    drive: "\"Follow the plan.\""
  },
  rebel: {
    title: "The Rebel",
    superpower: "Breaking Constraints.",
    operation: "You challenge every rule and thrive on radical, unconventional solutions.",
    kryptonite: "Rigid structures and unquestioned authority.",
    drive: "\"Why not?\""
  },
  visionary: {
    title: "The Visionary",
    superpower: "Seeing What Could Be.",
    operation: "You lead with groundbreaking ideas and thrive on the unknown.",
    kryptonite: "Practical details and immediate constraints.",
    drive: "\"What if...?\""
  },
  guardian: {
    title: "The Guardian",
    superpower: "Protecting The Mission.",
    operation: "You lead with fierce loyalty and drive momentum with unstoppable energy.",
    kryptonite: "Ambiguity and radical, untested change.",
    drive: "\"What is the plan?\""
  },
  navigator: {
    title: "The Navigator",
    superpower: "Guiding Through Chaos.",
    operation: "You thrive on exploration, adapting to new environments and leading others through uncertainty.",
    kryptonite: "Rigid plans and staying in one place for too long.",
    drive: "\"Where to next?\""
  },
  seeker: {
    title: "The Seeker",
    superpower: "Uncovering The Truth.",
    operation: "You are a master of analysis, digging deep to find the real signal in the noise.",
    kryptonite: "Surface-level answers and emotional decision-making.",
    drive: "\"What is really going on here?\""
  },
  vessel: {
    title: "The Vessel",
    superpower: "Creating Calm.",
    operation: "You provide a source of peace and stability, holding emotional space for others.",
    kryptonite: "High-conflict situations and emotional volatility.",
    drive: "\"Breathe.\""
  },
  partner: {
    title: "The Partner",
    superpower: "Unwavering Stability.",
    operation: "You are the reliable anchor, providing consistent support and keeping things on track.",
    kryptonite: "Sudden changes and inconsistent people.",
    drive: "\"Let's stick together.\""
  },
  diplomat: {
    title: "The Diplomat",
    superpower: "Building Bridges.",
    operation: "You connect with others through deep empathy, smoothing turbulence and fostering harmony.",
    kryptonite: "Blunt criticism and impersonal decisions.",
    drive: "\"How does everyone feel?\""
  },
  spotlight: {
    title: "The Spotlight",
    superpower: "Energizing The Room.",
    operation: "You are a magnetic presence, inspiring and motivating others with infectious energy and fun.",
    kryptonite: "Boring, repetitive tasks and being out of the loop.",
    drive: "\"Let's make it exciting!\""
  },
  architect: {
    title: "The Architect",
    superpower: "Designing The System.",
    operation: "You are a master of structure and order, bringing coherence to complex challenges.",
    kryptonite: "Improvisation and unpredictable, chaotic environments.",
    drive: "\"What is the optimal design?\""
  },
  provider: {
    title: "The Provider",
    superpower: "Taking Care.",
    operation: "You are the reliable backbone, ensuring everyone's needs are met with practical action.",
    kryptonite: "Selfishness and seeing others neglected.",
    drive: "\"I've got this.\""
  },
  unknown: {
    title: "The Adaptable",
    superpower: "Flexibility.",
    operation: "You are a balanced individual who can adjust to the needs of the moment.",
    kryptonite: "Lack of a clear, specialized role.",
    drive: "\"What is needed now?\""
  }
};

interface DualityNarrative {
  title: string;
  summary: string;
}

const DUALITY_NARRATIVES: Record<string, DualityNarrative> = {
  'guardian-visionary': {
    title: "The Spark & The Foundation",
    summary: "A dynamic of innovation and stability. The Visionary's job is to light the fire; the Guardian's job is to make sure it warms the camp instead of burning it down."
  },
  'rebel-sovereign': {
    title: "The Irresistible Force vs. The Immovable Object",
    summary: "A fundamental clash between chaos and order. The Rebel exists to break the rules that the Sovereign writes. This pairing can lead to explosive growth or complete gridlock."
  },
  'architect-visionary': {
    title: "The Dreamer & The Builder",
    summary: "A powerful dynamic of ideas and execution. The Visionary charts the course with bold new ideas, while the Architect designs the flawless ship to get there."
  },
  'diplomat-seeker': {
    title: "The Heart & The Mind",
    summary: "A pairing that balances deep emotional intelligence with rigorous intellectual honesty. The Diplomat ensures the truth is delivered with kindness; the Seeker ensures the kindness is rooted in truth."
  },
  'sovereign-visionary': {
    title: "The Empire & The Insurrection",
    summary: "A classic clash of execution vs. inspiration. The Sovereign builds the empire; the Visionary dreams of the one that will replace it. This dynamic can lead to immense, generational progress or a frustrating stalemate."
  },
  'spotlight-vessel': {
    title: "The Star & The Sea",
    summary: "A dynamic of dazzling energy and deep calm. The Spotlight shines brightly, drawing all eyes, while the Vessel provides a quiet, stabilizing depth beneath the surface."
  },
  'architect-rebel': {
    title: "The System & The Glitch",
    summary: "A volatile pairing of pure structure and pure anti-structure. The Architect builds the perfect system; the Rebel is compelled to find its flaws and break it. This can lead to either a perfectly resilient system or total collapse."
  },
  'provider-seeker': {
    title: "The Helper & The Analyst",
    summary: "A dynamic of practical care versus intellectual truth. The Provider wants to solve the immediate, tangible problem; the Seeker wants to understand the root cause, even if it's uncomfortable."
  },
  'navigator-partner': {
    title: "The Explorer & The Anchor",
    summary: "A pairing of adventure and stability. The Navigator wants to see what's over the horizon, while the Partner wants to build a comfortable and reliable home base."
  },
  'diplomat-guardian': {
    title: "The Shield & The Handshake",
    summary: "A powerful leadership dynamic that combines protective strength with social harmony. The Guardian protects the team's mission, while the Diplomat protects the team's morale."
  },
  'provider-spotlight': {
    title: "The Caretaker & The Star",
    summary: "A dynamic of selfless support and radiant energy. The Provider works tirelessly behind the scenes to make sure everything is perfect, allowing the Spotlight to shine without any friction."
  },
  'architect-partner': {
    title: "The Designer & The Doer",
    summary: "A pairing of grand plans and steady execution. The Architect designs the intricate system, and the Partner diligently and reliably brings it to life, piece by piece."
  },
  'architect-diplomat': {
    title: "The Blueprint & The People",
    summary: "A dynamic between elegant systems and the messy humans who use them. The Architect designs the perfect machine; the Diplomat makes sure it's a machine people can, and want, to use."
  },
  'guardian-rebel': {
    title: "The Unstoppable Force vs. The Unruly Object",
    summary: "A fundamental conflict between momentum and disruption. The Guardian exists to push the mission forward at all costs, while the Rebel exists to question whether it's the right mission in the first place."
  },
  'seeker-visionary': {
    title: "The Telescope & The Microscope",
    summary: "A dynamic between expansive possibility and grounded truth. The Visionary sees the distant star to aim for; the Seeker has the detailed map of the terrain right in front of you."
  },
  'diplomat-partner': {
    title: "The Rock & The Glue",
    summary: "A dynamic of profound stability and social cohesion. The Partner provides a steady, reliable foundation, while the Diplomat ensures everyone feels connected and emotionally supported."
  },
  'architect-guardian': {
    title: "The Fortress Designers",
    summary: "A powerful combination of systematic design and fierce protection. The Architect designs the impregnable walls; the Guardian mans them with unwavering loyalty."
  },
  'diplomat-navigator': {
    title: "The Compassionate Expedition",
    summary: "This pairing excels at leading people through the unknown. The Navigator charts the course, while the Diplomat ensures the crew's morale and cohesion remain high."
  },
  'guardian-navigator': {
    title: "The Vanguard & The Scout",
    summary: "A dynamic of secure, rapid advancement. The Navigator explores ahead to find the safest path, and the Guardian drives the main force forward with unstoppable energy."
  },
  'guardian-partner': {
    title: "The Unbreakable Shield Wall",
    summary: "A pairing of pure defense and stability. The Guardian's proactive, energetic defense and the Partner's steadfast, reliable presence create an environment where everyone feels safe and supported."
  },
  'provider-rebel': {
    title: "The Helper & The Agitator",
    summary: "A clash between practical support and radical disruption. The Provider wants to meet the needs of the current system; the Rebel wants to tear the system down."
  },
  'seeker-spotlight': {
    title: "The Truth & The Story",
    summary: "A dynamic between rigorous analysis and compelling performance. The Seeker finds the objective truth; the Spotlight knows how to tell that truth in a way that energizes and engages the audience."
  },
  'sovereign-spotlight': {
    title: "The Crown & The Court Jester",
    summary: "A classic dynamic of formal power and informal influence. The Sovereign commands with authority and structure; the Spotlight leads with charisma and infectious energy."
  },
  'vessel-visionary': {
    title: "The Still Lake & The Star",
    summary: "A pairing of deep calm and boundless imagination. The Visionary's brilliant ideas are reflected and clarified in the Vessel's peaceful, stabilizing presence."
  },
  'architect-navigator': {
    title: "The Blueprint & The Explorer",
    summary: "A dynamic between meticulous planning and adaptive discovery. The Architect designs the perfect ship; the Navigator is eager to sail it off the edge of the map."
  },
  'provider-visionary': {
    title: "The Angel Investor & The Founder",
    summary: "A powerful dynamic of inspiration and support. The Visionary comes up with the world-changing idea, and the Provider offers the practical, selfless support to make it a reality."
  },
  'rebel-visionary': {
    title: "The Spark & The Wildfire",
    summary: "A volatile and highly creative pairing. The Visionary imagines a new world, and the Rebel is happy to help burn the old one down to make way for it."
  },
  'seeker-rebel': {
    title: "The Truth-Teller & The Rule-Breaker",
    summary: "A dynamic committed to radical honesty. The Seeker is compelled to find the inconvenient truth, and the Rebel is compelled to act on it, regardless of the rules."
  },
  'provider-sovereign': {
    title: "The Benevolent Ruler & The Royal Treasurer",
    summary: "A leadership dynamic of authority and care. The Sovereign sets the direction for the kingdom, and the Provider ensures all the citizens are fed, clothed, and cared for."
  },
  'architect-seeker': {
    title: "The Perfect System & The Perfect Question",
    summary: "A dynamic of intellectual rigor. The Architect builds the flawless logical system, and the Seeker stress-tests it by asking the one question that reveals its hidden flaws or assumptions."
  },
  'navigator-rebel': {
    title: "The Expedition Leader & The Mutineer",
    summary: "A volatile pairing of adaptable leadership and radical freedom. The Navigator wants to guide the group through chaos, while the Rebel wants to challenge the Navigator's authority at every turn."
  },
  'partner-sovereign': {
    title: "The Hand of the King & The King",
    summary: "A dynamic of absolute authority and unwavering loyalty. The Sovereign sets the grand strategy, and the Partner executes it with quiet, dependable competence."
  },
  'rebel-spotlight': {
    title: "The Rockstar & The Punk",
    summary: "A pairing of explosive, anti-establishment energy. The Rebel breaks the rules, and the Spotlight makes sure everyone is there to see it, turning a simple act of defiance into a cultural moment."
  },
  'architect-provider': {
    title: "The Master Craftsman & The Caretaker",
    summary: "A dynamic of precision and practicality. The Architect designs the perfect, intricate system, and the Provider ensures it runs smoothly and that everyone using it is taken care of."
  },
  'architect-sovereign': {
    title: "The Master Planner & The Supreme Commander",
    summary: "A formidable pairing for large-scale execution. The Architect provides the flawless, detailed blueprint, and the Sovereign provides the authority and organizational power to make it a reality."
  },
  'architect-spotlight': {
    title: "The Auteur & The Movie Star",
    summary: "A dynamic of meticulous design and charismatic performance. The Architect creates the perfect script, set, and lighting, and the Spotlight steps in to deliver a captivating, unforgettable performance."
  },
  'architect-vessel': {
    title: "The Zen Garden Designer & The Still Pond",
    summary: "A pairing of intricate design and deep calm. The Architect finds satisfaction in creating perfect, ordered systems, and the Vessel provides the peaceful, non-disruptive environment for that work to happen."
  },
  'diplomat-provider': {
    title: "The Heart & The Hands",
    summary: "A deeply compassionate pairing focused on care. The Diplomat intuits the emotional needs of the group, and the Provider translates that intuition into practical, tangible action."
  },
  'diplomat-rebel': {
    title: "The Peacemaker & The Provocateur",
    summary: "A volatile dynamic between harmony and disruption. The Diplomat's goal is to make sure everyone feels good, while the Rebel's goal is to challenge the very definition of 'good'."
  },
  'diplomat-sovereign': {
    title: "The Iron Fist & The Velvet Glove",
    summary: "A classic leadership dynamic of power and influence. The Sovereign commands with formal authority, while the Diplomat leads through empathy and social grace. What one cannot achieve, the other can."
  },
  'diplomat-spotlight': {
    title: "The Host & The Life of the Party",
    summary: "An incredibly potent social pairing. The Diplomat creates a warm, welcoming environment where everyone feels included, and the Spotlight fills that space with infectious energy and excitement."
  },
  'diplomat-vessel': {
    title: "The Empath & The Anchor",
    summary: "A pairing of immense emotional stability. The Diplomat actively soothes and connects with others, while the Vessel provides a passive, calming presence. Together, you can create a space of profound peace."
  },
  'navigator-provider': {
    title: "The Trailblazer & The Quartermaster",
    summary: "A dynamic of ambitious exploration and practical support. The Navigator wants to see what's over the next hill, and the Provider makes sure everyone has enough food, water, and supplies to get there safely."
  },
  'navigator-seeker': {
    title: "The Scout & The Cartographer",
    summary: "An intellectually rigorous exploration team. The Navigator pushes into unknown territory, and the Seeker meticulously maps and analyzes what they find, separating valuable resources from dangerous illusions."
  },
  'navigator-sovereign': {
    title: "The Conquistador & The King",
    summary: "A dynamic of expansion and control. The Navigator explores and claims new territory, while the Sovereign builds the systems and infrastructure to govern it."
  },
  'navigator-spotlight': {
    title: "The Tour Guide & The Entertainer",
    summary: "A highly engaging and adventurous pairing. The Navigator knows all the most exciting places to go, and the Spotlight makes sure that the journey is as fun and memorable as the destination."
  },
  'navigator-vessel': {
    title: "The Deep Sea Explorer & The Calm Ocean",
    summary: "A pairing that combines adventurous exploration with a deep sense of peace. The Navigator is comfortable in the unknown, and the Vessel's calming presence ensures that the journey is never frantic or stressful."
  },
  'partner-provider': {
    title: "The Unsung Heroes",
    summary: "A dynamic of quiet, selfless competence. Both the Partner and the Provider find satisfaction in supporting others and ensuring the system runs smoothly. You are the definition of trustworthy."
  },
  'partner-rebel': {
    title: "The Anchor & The Storm",
    summary: "A fundamental clash between stability and chaos. The Partner craves routine, predictability, and loyalty, while the Rebel is driven to disrupt, challenge, and break every rule."
  },
  'partner-seeker': {
    title: "The Practitioner & The Theorist",
    summary: "A dynamic of doing vs. understanding. The Partner is focused on the practical, repeatable process of getting the job done, while the Seeker is focused on understanding the deep, underlying principles."
  },
  'partner-spotlight': {
    title: "The Stagehand & The Star",
    summary: "A classic 'behind-the-scenes' dynamic. The Partner works diligently and reliably to make sure everything is perfect, creating the stable platform upon which the Spotlight can shine."
  },
  'partner-visionary': {
    title: "The Foundation & The Skyscraper",
    summary: "A dynamic of bold ideas and steady execution. The Visionary dreams up an impossible new future, and the Partner provides the patient, day-by-day execution needed to see it through, brick by brick."
  },
  'seeker-sovereign': {
    title: "The Royal Advisor & The King",
    summary: "A dynamic of truth and power. The Seeker provides the Sovereign with unvarnished, data-driven analysis, allowing the Sovereign to make decisions based on reality, not fantasy."
  },
  'seeker-vessel': {
    title: "The Analyst & The Meditator",
    summary: "A pairing of deep, quiet contemplation. The Seeker finds truth through rigorous external analysis, while the Vessel finds peace through quiet internal observation. Both are comfortable with silence."
  },
  'sovereign-vessel': {
    title: "The Emperor & The Still Garden",
    summary: "A dynamic of absolute control and deep peace. The Sovereign builds an empire with unshakable order, and the Vessel provides a space of calm and tranquility within it. Power and peace, side by side."
  },
  'diplomat-visionary': {
    title: "The Social Futurist & The Innovator",
    summary: "A dynamic of inspiring ideas and social harmony. The Visionary imagines a better future, and the Diplomat knows how to get people on board with the idea, making innovation feel exciting and safe."
  },
  'guardian-provider': {
    title: "The Bodyguard & The Medic",
    summary: "A powerful support pairing. The Guardian protects the team from external threats, while the Provider ensures everyone on the team has the practical resources they need to thrive."
  },
  'guardian-seeker': {
    title: "The Inquisitor & The Watchman",
    summary: "A dynamic of rigorous truth and unwavering protection. The Seeker asks the hard questions to find the real threat, and the Guardian neutralizes that threat with focused energy."
  },
  'guardian-sovereign': {
    title: "The King's Guard & The King",
    summary: "A formidable leadership dynamic. The Sovereign sets the strategy and commands the kingdom, while the Guardian provides the fierce, energetic loyalty to execute the plan and protect the realm."
  },
  'guardian-spotlight': {
    title: "The Hype Man & The Headliner",
    summary: "A dynamic of infectious energy and focused drive. The Spotlight gets the crowd excited, and the Guardian channels that excitement into a single, focused objective."
  },
  'guardian-vessel': {
    title: "The Stormwall & The Harbor",
    summary: "A dynamic of active protection and passive security. The Guardian actively patrols the perimeter, neutralizing threats, while the Vessel provides a calm, safe space deep within the walls."
  },
  'navigator-visionary': {
    title: "The Explorer & The Astronomer",
    summary: "A pairing driven by pure discovery. The Visionary points to a distant, unseen star, and the Navigator charts a practical course to get there."
  },
  'partner-vessel': {
    title: "The Lighthouse & The Shore",
    summary: "A pairing of immense stability. The Partner provides a steady, reliable beacon of consistency, while the Vessel offers a calm, peaceful environment. Together, you create a haven of predictability."
  },
  'provider-vessel': {
    title: "The Nurse & The Serene Patient",
    summary: "A dynamic of active care and passive peace. The Provider finds satisfaction in taking practical action to help others, while the Vessel's calm presence makes that care easy and rewarding to give."
  },
  'rebel-vessel': {
    title: "The Anarchist & The Pacifist",
    summary: "A fundamental conflict between disruption and peace. The Rebel is driven to create chaos to challenge the system, while the Vessel is driven to create calm to escape it."
  }
};

interface DualityPoint {
  title: string;
  narrative: string;
  playbook?: {
    a: string;
    b: string;
  }
}

interface ArchetypeInteraction {
  sync: DualityPoint;
  clash: DualityPoint;
}

const ARCHETYPE_INTERACTIONS: Record<string, ArchetypeInteraction> = {
  'guardian-visionary': {
    sync: {
      title: "Unstoppable Momentum",
      narrative: "When the Visionary's groundbreaking idea aligns with the Guardian's mission, you become an unstoppable force. The Visionary provides the 'what if,' and the Guardian provides the 'how,' creating a powerful dynamic of inspired execution."
    },
    clash: {
      title: "Innovation vs. Security",
      narrative: "The Visionary's love for radical, untested ideas will clash with the Guardian's need for stability and planning. The Visionary will feel blocked; the Guardian will feel the mission is at risk.",
      playbook: {
        a: "Frame your new idea as an upgrade to the existing plan, not a total replacement. Show how it makes the mission *safer*.",
        b: "When you feel the urge to say 'no' to a new idea, instead ask, 'What is the smallest, safest way we can test this?'"
      }
    }
  },
  'rebel-sovereign': {
    sync: {
        title: "Effective Revolution",
        narrative: "When the Sovereign's system becomes truly outdated, the Rebel is the perfect tool to shatter it. The Sovereign can then build a new, better system from the pieces. This is a pairing for radical transformation."
    },
    clash: {
        title: "Authority vs. Autonomy",
        narrative: "This is the core conflict. The Sovereign leads by creating rules; the Rebel feels alive only when breaking them. The Sovereign will see the Rebel as a threat to stability; the Rebel will see the Sovereign as an oppressive force.",
        playbook: {
            a: "Your job is to aim your fire at the *right* walls. Don't break their rules just because they exist; break the ones that are truly holding things back.",
            b: "Your job is to build a kingdom with walls, not a prison. Give your Rebel a territory to run, a place where their chaos can lead to creative breakthroughs."
        }
    }
  },
  'architect-visionary': {
      sync: {
          title: "From Dream to Reality",
          narrative: "This is the classic pairing of invention. The Visionary dreams up impossible futures, and the Architect engineers them into existence. When you're aligned on a vision, there is nothing you cannot build."
      },
      clash: {
          title: "Purity of Idea vs. Physical Reality",
          narrative: "The Visionary can get frustrated by the practical constraints of reality (time, budget, physics) that the Architect lives by. The Architect, in turn, can see the Visionary as an unrealistic client who keeps changing the blueprint.",
          playbook: {
              a: "Your job is to deliver a clear 'what' and 'why,' but give the Architect ownership over the 'how.' Respect their expertise in the real world.",
              b: "Your job is to show the Visionary what's possible within the constraints, not just what isn't. Offer creative alternatives, not just roadblocks."
          }
      }
  },
  'diplomat-seeker': {
      sync: {
        title: "Wise Counsel",
        narrative: "The Seeker finds the hard truth, and the Diplomat finds a way to speak it without causing a war. Together, you can navigate incredibly complex social and intellectual problems, making you a trusted advisory team."
      },
      clash: {
        title: "Brutal Honesty vs. Compassionate Harmony",
        narrative: "The Seeker's unvarnished truth can feel cruel to the Diplomat, who prioritizes emotional well-being. The Diplomat's tendency to soften the truth can feel dishonest to the Seeker, who prizes intellectual purity above all.",
        playbook: {
          a: "Your job is to remember that a truth delivered without compassion is often rejected. Let the Diplomat help you frame your findings so they can be heard.",
          b: "Your job is to ensure that in your quest for harmony, you don't hide a truth that needs to be heard. You are the delivery mechanism, not the filter."
        }
      }
  },
  'sovereign-visionary': {
    sync: {
      title: "World Building",
      narrative: "When the Visionary's grand idea is compelling enough, the Sovereign is the single best archetype to make it real. The Sovereign's mastery of systems, combined with the Visionary's boundless imagination, can build unshakable institutions and legendary projects."
    },
    clash: {
      title: "The Plan vs. The 'What If'",
      narrative: "The Sovereign lives by the plan. The Visionary lives to replace it. The Visionary's constant stream of new ideas will feel like a chaotic, undisciplined threat to the Sovereign's carefully constructed order. The Sovereign's adherence to 'the way things are' will feel like a prison to the Visionary.",
      playbook: {
        a: "Your job is to sell the *destination*, not the first step. Show the Sovereign the glorious future your idea unlocks, and let them own the plan to get there.",
        b: "Your job is to build a system that has room for an R&D department. Create a safe space for the Visionary's chaos to exist without threatening the stability of your core mission."
      }
    }
  },
  'spotlight-vessel': {
    sync: {
      title: "Magnetic Presence",
      narrative: "Together, you create an incredibly inviting social space. The Spotlight's energy makes things exciting, and the Vessel's calm makes people feel safe. You can host anything from a wild party to a deep conversation."
    },
    clash: {
      title: "Pace & Energy Mismatch",
      narrative: "The Spotlight is always 'on' and thrives on external validation, which can feel exhausting and shallow to the Vessel, who needs peace to recharge. The Vessel's passivity can feel boring to the Spotlight.",
      playbook: {
        a: "Recognize that the Vessel's quiet is a strength, not a judgment. Create 'opt-in' moments for them to join the fun, and respect when they need to retreat.",
        b: "Give the Spotlight a clear signal when your battery is low, rather than just fading away. A simple, 'I need 20 minutes of quiet' is a gift of clarity."
      }
    }
  },
  'architect-rebel': {
    sync: {
      title: "Anti-Fragile Design",
      narrative: "The Rebel is the perfect stress-test for the Architect's designs. The Rebel's attempts to break the system will reveal its weakest points, allowing the Architect to rebuild it stronger than before. This is how you achieve perfection."
    },
    clash: {
      title: "Blueprint vs. Impulse",
      narrative: "The Architect lives by the blueprint. The Rebel lives for the moment of creative destruction. The Architect will see the Rebel as a chaotic force of destruction; the Rebel will see the Architect as a rigid, controlling bureaucrat.",
      playbook: {
        a: "Build a 'break room'—a designated part of the system where the Rebel is *supposed* to cause chaos. Give them a sandbox to play in.",
        b: "Be a scalpel, not a sledgehammer. Find the single, most elegant flaw in the system and expose it, rather than just smashing the whole thing."
      }
    }
  },
  'provider-seeker': {
    sync: {
      title: "Truly Effective Solutions",
      narrative: "When the Seeker's deep analysis correctly identifies the *real* problem, the Provider is the best archetype to execute the solution flawlessly. The Seeker provides the 'why,' and the Provider handles the 'how'."
    },
    clash: {
      title: "Action vs. Information",
      narrative: "The Provider's instinct is to act and help *now*, which can feel premature to the Seeker, who needs more information. The Seeker's need for analysis can feel like cold, unhelpful detachment to the Provider.",
      playbook: {
        a: "Ask the Seeker, 'What is the one piece of information you need before we can act?' This focuses their analysis on a concrete next step.",
        b: "Offer a 'minimum viable truth'—the smallest piece of insight that allows the Provider to take a helpful first step, even if your analysis isn't 100% complete."
      }
    }
  },
  'navigator-partner': {
    sync: {
      title: "A Home to Return To",
      narrative: "The Partner provides the stable base that gives the Navigator the confidence to explore. The Navigator brings back new energy and ideas that keep the Partner's world from becoming stagnant. You give each other the best of both worlds."
    },
    clash: {
      title: "Restlessness vs. Routine",
      narrative: "The Navigator's constant need for newness can feel destabilizing and unreliable to the Partner. The Partner's love for predictable routines can feel like a cage to the Navigator.",
      playbook: {
        a: "Create rituals of return. Schedule your adventures, but also schedule your time at home. Show the Partner that 'exploring' doesn't mean 'leaving forever'.",
        b: "Be the 'port of call,' not the 'anchor.' Be the warm, welcoming place they always want to return to, not the chain that keeps them from leaving."
      }
    }
  },
  'diplomat-guardian': {
    sync: {
      title: "Beloved Leadership",
      narrative: "Together, you can lead a team through anything. The Guardian's energy drives the mission forward, while the Diplomat's empathy ensures everyone feels heard and valued along the way. People will follow you anywhere."
    },
    clash: {
      title: "The Mission vs. The People",
      narrative: "The Guardian can become so focused on the goal that they run over people's feelings, which is the Diplomat's worst nightmare. The Diplomat's focus on keeping everyone happy can feel like a distraction from the mission to the Guardian.",
      playbook: {
        a: "Be the Guardian's trusted advisor on morale. Frame your feedback as a strategic concern: 'The team is losing morale, which puts the mission at risk.'",
        b: "Remember that morale *is* a mission-critical resource. Schedule regular check-ins with your Diplomat to get a read on the team's emotional state."
      }
    }
  },
  'provider-spotlight': {
    sync: {
      title: "A Flawless Performance",
      narrative: "This is the classic 'star and manager' dynamic. The Provider's high Agreeableness and Conscientiousness means they gain genuine satisfaction from helping the Spotlight succeed. The Spotlight, in turn, provides the energy and excitement that can make the Provider's hard work feel meaningful and appreciated."
    },
    clash: {
      title: "Visibility vs. Invisibility",
      narrative: "Friction arises when the Provider's tireless, behind-the-scenes work goes completely unacknowledged by the Spotlight, who naturally soaks up all the credit. The Provider can feel like an invisible servant, and the Spotlight can feel unfairly burdened by the Provider's unspoken need for validation.",
      playbook: {
        a: "Your job is to give the Spotlight public, enthusiastic credit for their 'invisible' work. Be the one who says, 'None of this would be possible without them.' Your praise is a powerful currency.",
        b: "Your job is to learn to ask for the specific appreciation you need. Instead of hoping they'll notice, say, 'I'd love for you to mention the work I did on the logistics for this.' Don't make them guess."
      }
    }
  },
  'architect-partner': {
    sync: {
      title: "Perfect Execution",
      narrative: "When the Architect's plan is clear and well-designed, there is no one better than the Partner to execute it with precision and reliability. The Architect loves the plan; the Partner loves the reliable work. It's a perfect match for projects that require long-term, steady effort."
    },
    clash: {
      title: "The Grand Plan vs. The Human Element",
      narrative: "The Architect can become so focused on the perfection of the system that they forget the human needs of the person building it. The Partner's need for a steady, predictable pace and personal connection can feel like an annoying variable in the Architect's grand equation.",
      playbook: {
        a: "Your job is to remember that the 'Doer' is not a machine. Build human moments into your plan: check-ins, moments for feedback, and genuine appreciation for their steady work.",
        b: "Your job is to speak up when the plan is becoming inhuman. Frame it in terms of the project's success: 'I can't maintain this pace and guarantee quality. Let's adjust the timeline.'"
      }
    }
  },
  'architect-diplomat': {
    sync: {
      title: "Human-Centered Design",
      narrative: "When aligned, you create systems that are not only efficient but also beloved. The Architect's logical rigor, filtered through the Diplomat's empathy, produces incredibly effective and humane solutions. You build things that people truly need, and you do it with grace."
    },
    clash: {
      title: "Logic vs. Emotion",
      narrative: "The Architect's focus on logical purity can feel cold and dismissive to the Diplomat, who prioritizes human feelings. The Diplomat's focus on individual exceptions and feelings can feel like an irrational obstacle to the Architect's clean design.",
      playbook: {
        a: "Your job is to see the Diplomat as your ultimate beta tester. If your system is confusing or frustrating to them, it's not a problem with the user—it's a flaw in the design.",
        b: "Your job is to translate feelings into data. Show the Architect how 'unhappy users' is a metric that impacts the system's success. Frame empathy as a design requirement."
      }
    }
  },
  'guardian-rebel': {
    sync: {
      title: "Resilient Progress",
      narrative: "When the Rebel's disruptive questions are aimed at a real flaw in the mission, and the Guardian is willing to listen, you create unstoppable, adaptive progress. The Guardian ensures you're moving fast, and the Rebel ensures you're moving in the right direction."
    },
    clash: {
      title: "Momentum vs. Sabotage",
      narrative: "The Guardian's intense focus can look like blind obedience to the Rebel. The Rebel's constant questioning can look like sabotage to the Guardian. One screams 'Go!', the other screams 'Why?', leading to a frustrating deadlock.",
      playbook: {
        a: "Your job is to build a process for hearing dissent. Create a 'red team' role for your Rebel, where their job is explicitly to find the flaws in the plan before the enemy does.",
        b: "Your job is to be the loyal opposition. Frame your challenges as a way to make the mission *stronger*. Ask questions that test the plan, rather than just attacking it."
      }
    }
  },
  'seeker-visionary': {
    sync: {
      title: "Grounded Innovation",
      narrative: "When a Visionary's idea survives a Seeker's rigorous analysis, it's almost certainly a world-changer. The Seeker's questions ground the Visionary's flights of fancy in reality, and the Visionary's ideas give the Seeker a problem worth solving. Together, you can turn science fiction into fact."
    },
    clash: {
      title: "Inspiration vs. Data",
      narrative: "The Seeker's constant need for proof can feel like a wet blanket on the Visionary's creative fire. The Visionary's disregard for current limitations can feel like delusional nonsense to the Seeker. One lives in 'what if,' the other in 'what is'.",
      playbook: {
        a: "Your job is to analyze the 'what if' as rigorously as you analyze the 'what is.' Instead of asking 'Is this true now?,' ask 'What would have to be true for this to work?'",
        b: "Your job is to treat the Seeker's questions not as an attack, but as a series of requirements. Each 'how?' is a problem to be solved, not a reason to stop dreaming."
      }
    }
  },
  'diplomat-partner': {
    sync: {
      title: "Unshakable Trust",
      narrative: "When you're aligned, you create an environment of absolute psychological safety. The Partner's consistency and the Diplomat's empathy mean everyone feels secure and cared for. You are the ultimate foundation for any group."
    },
    clash: {
      title: "Routine vs. Relationship",
      narrative: "The Partner's focus on maintaining stable routines can feel rigid to the Diplomat, who needs to adapt to the emotional needs of the moment. The Diplomat's need to check in on feelings can feel like an inefficient distraction to the Partner.",
      playbook: {
        a: "Your job is to frame your emotional check-ins as a way to keep the Partner's plan on track. Show them how addressing feelings now prevents bigger disruptions later.",
        b: "Your job is to see that emotional harmony *is* part of the plan for long-term stability. Schedule time for the Diplomat to work their magic, treating it as a critical part of maintaining the system."
      }
    }
  },
  'architect-guardian': {
    sync: {
      title: "Perfect Defense",
      narrative: "When aligned on what to protect, you are unbeatable. The Architect's resilient system design combined with the Guardian's energetic execution creates security that is both intelligent and fierce."
    },
    clash: {
      title: "The Blueprint vs. The Mission",
      narrative: "The Architect can get lost in perfecting the blueprint, while the Guardian is focused on driving the mission forward *now*. The Architect's need for perfection can feel like a delay; the Guardian's urgency can feel like a compromise of quality.",
      playbook: {
        a: "Provide the Guardian with a 'good enough for now' version of the plan they can execute, while you iterate on the perfect version in the background.",
        b: "Frame your need for speed in terms of mission risk. 'If we don't move now, we're exposed. Let's use the current plan and improve it on the move.'"
      }
    }
  },
  'diplomat-navigator': {
    sync: {
      title: "Deeply Human Exploration",
      narrative: "You can lead teams through very high-stress, uncertain situations without them falling apart. The Navigator finds the path, and the Diplomat makes sure everyone feels supported while walking it."
    },
    clash: {
      title: "The Destination vs. The Journey",
      narrative: "The Navigator is focused on the next point on the map, while the Diplomat is focused on the feelings of the people on the journey. The Navigator can seem callous in their pursuit of the goal; the Diplomat can seem aimless.",
      playbook: {
        a: "Frame morale and team cohesion as a critical resource required to reach the destination. 'If the team burns out, we will never get there.'",
        b: "Build emotional check-ins into your route plan. Treat team harmony as a necessary stop on the map, not a diversion from it."
      }
    }
  },
  'guardian-navigator': {
    sync: {
      title: "Secure, Rapid Advance",
      narrative: "You excel at moving a group through uncertain territory quickly and safely. The Navigator's foresight prevents ambushes and wrong turns, and the Guardian's drive ensures you're never standing still."
    },
    clash: {
      title: "The Map vs. The Mission",
      narrative: "The Guardian is committed to the original mission objective, while the Navigator is constantly adapting the plan based on new discoveries. The Guardian sees this as a dangerous distraction; the Navigator sees it as essential adaptation.",
      playbook: {
        a: "Define the mission by its *intent* rather than its specific path. Give the Navigator the flexibility to change the 'how' as long as they are serving the 'why.'",
        b: "Frame your course corrections in the language of mission success. Show the Guardian how your new path is a *safer* or *faster* way to achieve their stated objective."
      }
    }
  },
  'guardian-partner': {
    sync: {
      title: "Absolute Security",
      narrative: "When you agree on what needs protecting, nothing can get through. The Guardian's proactive, energetic defense and the Partner's steadfast, reliable presence create an environment where everyone feels safe and supported."
    },
    clash: {
      title: "Action vs. Patience",
      narrative: "The Guardian's high energy and need for momentum can feel like a disruptive force to the Partner's calm, steady routine. The Partner's preference for consistency can feel like passive inaction to the Guardian.",
      playbook: {
        a: "Channel your protective energy into reinforcing the Partner's routines. See their stability as the core of what you're defending, not an obstacle to your momentum.",
        b: "Give the Guardian clear, predictable tasks they can execute to 'defend the perimeter.' This provides an outlet for their energy that doesn't disrupt your core stability."
      }
    }
  },
  'provider-rebel': {
    sync: {
      title: "Effective Compassion",
      narrative: "When the system the Provider is supporting is genuinely unjust or broken, the Rebel is the perfect ally to break it. The Rebel shatters the harmful structure, clearing the way for the Provider to build something new and genuinely helpful."
    },
    clash: {
      title: "Helpfulness vs. Disruption",
      narrative: "The Provider's instinct is to work within the rules to help people. The Rebel's instinct is to break the rules, even if it causes immediate disruption for the people the Provider is trying to help. One is trying to fix the system from within, the other is trying to burn it down from the outside.",
      playbook: {
        a: "Recognize when the system is the real source of the problem. Your job is not to endlessly patch a sinking ship; it's to help the Rebel build a better one.",
        b: "Aim your fire at the rules, not the people. Show the Provider how breaking the *right* constraint will ultimately help them take better care of everyone."
      }
    }
  },
  'seeker-spotlight': {
    sync: {
      title: "Edutainment",
      narrative: "When the Seeker's deep insights are paired with the Spotlight's energetic delivery, you have the power to make complex topics engaging and accessible. The Seeker provides the substance; the Spotlight provides the style. You can command any stage."
    },
    clash: {
      title: "Depth vs. Delivery",
      narrative: "The Seeker can become frustrated with the Spotlight's tendency to simplify or 'dumb down' the truth for the sake of entertainment. The Spotlight can find the Seeker's need for nuance and precision to be boring and unengaging for an audience.",
      playbook: {
        a: "Trust the Spotlight's expertise in communication. Your job is to provide the most accurate, potent core truth, and then let them package it in a way that people can actually hear.",
        b: "Your job is to honor the core of the Seeker's discovery. Find a way to make the truth exciting without making it inaccurate. Your energy is the vehicle for their insight, not a replacement for it."
      }
    }
  },
  'sovereign-spotlight': {
    sync: {
      title: "Commanding Presence",
      narrative: "Together, you can project an aura of absolute authority and influence. The Sovereign's formal structure and planning, combined with the Spotlight's charismatic energy, creates a leadership style that is both organized and inspiring."
    },
    clash: {
      title: "The Plan vs. The Vibe",
      narrative: "The Sovereign lives and dies by the plan, while the Spotlight lives and dies by the energy of the room. The Spotlight's improvisational, people-pleasing nature can feel like a chaotic threat to the Sovereign's order. The Sovereign's rigidity can feel like a buzzkill to the Spotlight.",
      playbook: {
        a: "Build moments of planned spontaneity into your system. Create a stage where the Spotlight is *supposed* to improvise and energize the crowd, containing their chaos in a productive way.",
        b: "Use your energy to celebrate the Sovereign's plan. Be the hype-man for their structure. Your excitement can make their rigid system feel like an exciting game to be won."
      }
    }
  },
  'vessel-visionary': {
    sync: {
      title: "Incubation",
      narrative: "The Vessel's calm, non-judgmental presence creates the perfect safe space for the Visionary's wildest ideas to be born. The Vessel provides the quiet pond where the Visionary's 'what if' can land without causing disruptive waves."
    },
    clash: {
      title: "Stillness vs. Constant Change",
      narrative: "The Visionary's endless stream of new, world-changing ideas can feel like a constant state of disruption to the Vessel, who craves peace and stability. The Vessel's quiet passivity can feel like a lack of engagement or excitement to the Visionary.",
      playbook: {
        a: "Think of the Vessel not as a passive audience, but as the silent partner who creates the conditions for your best work. Their calm is a resource for you to draw upon, not a void to be filled.",
        b: "Your job is not to get excited *with* the Visionary, but to provide the calm *for* the Visionary. Offer quiet, stabilizing feedback, like 'That's a powerful idea. Let it breathe for a moment.'"
      }
    }
  },
  'architect-navigator': {
    sync: {
      title: "Intelligent Exploration",
      narrative: "When aligned, you can explore complex, dangerous environments with maximum efficiency and safety. The Architect's systems-thinking ensures your expedition is well-planned and resilient, while the Navigator's adaptability ensures you can handle any unexpected challenges along the way."
    },
    clash: {
      title: "The Plan vs. The Detour",
      narrative: "The Architect is focused on executing the perfect plan, while the Navigator is always looking for an interesting new path or a surprising discovery. The Navigator's desire to improvise can feel like a chaotic threat to the Architect's carefully designed system.",
      playbook: {
        a: "Build discovery time into your plan. Create a system that has designated 'off-roading' periods, giving the Navigator a structured way to explore without derailing the entire project.",
        b: "Frame your desire to explore as a form of data collection. You're not abandoning the plan; you're stress-testing it and gathering information to make the Architect's next design even better."
      }
    }
  },
  'provider-visionary': {
    sync: {
      title: "From Dream to Done",
      narrative: "This is a powerful engine for positive change. The Visionary's inspiring ideas give the Provider a meaningful mission to serve, and the Provider's practical, tireless execution gives the Visionary's dreams a foundation in reality.",
    },
    clash: {
      title: "Infinite Ideas vs. Finite Resources",
      narrative: "The Visionary is an endless fountain of new ideas, which can be exhausting for the Provider, who is trying to manage the practical details of the *current* project. The Provider can feel like they're constantly disappointing an insatiable client.",
      playbook: {
        a: "Your job is to provide practical, grounding feedback. Instead of saying 'yes' to everything, ask 'What should I stop doing to make room for this new idea?' This helps the Visionary prioritize.",
        b: "Your job is to celebrate the Provider's work. They derive satisfaction from taking care of things, so make sure they know their effort is seen and valued. Acknowledge their hard work before you introduce your next big idea."
      }
    }
  },
  'rebel-visionary': {
    sync: {
      title: "Revolution",
      narrative: "When you are aligned against a common enemy—an outdated system, an unjust rule—you are an unstoppable force for change. The Visionary provides the inspiring alternative future, and the Rebel provides the destructive energy to clear the path.",
    },
    clash: {
      title: "Creation vs. Destruction",
      narrative: "The Visionary's ultimate goal is to build something new, while the Rebel's primary satisfaction comes from tearing something down. Friction arises when the Rebel's chaotic energy continues long after the 'enemy' is gone, disrupting the Visionary's attempts to build.",
      playbook: {
        a: "Your job is to aim the Rebel's fire at the right target. Give them a clear enemy to focus on, and be prepared to provide a *new* enemy once the old one is vanquished. Their energy needs a target.",
        b: "Your job is to be a scalpel, not just a sledgehammer. Learn to enjoy the creative act of dismantling something with precision. Take pride in breaking the *right* thing at the *right* time."
      }
    }
  },
  'rebel-seeker': {
    sync: {
      title: "Speaking Truth to Power",
      narrative: "You are a powerful combination for exposing inconvenient truths. The Seeker does the deep, rigorous work to find the real signal, and the Rebel has the courage to broadcast that signal, even if it breaks every rule of politeness and protocol.",
    },
    clash: {
      title: "Purity of Truth vs. Freedom of Action",
      narrative: "The Seeker is obsessed with getting the analysis exactly right, which can feel like a slow, bureaucratic process to the action-oriented Rebel. The Rebel's desire to 'just break something' can feel intellectually sloppy and premature to the Seeker.",
      playbook: {
        a: "Give the Rebel a 'minimum viable truth' to act on. Find the smallest, most rigorously proven piece of your analysis and let them run with it while you continue your deeper investigation.",
        b: "Respect the process. The Seeker's analysis is the source of your legitimacy. Your actions have more impact when they are backed by their rigor. Use their findings as your ammunition."
      }
    }
  },
  'provider-sovereign': {
    sync: {
      title: "A Thriving Kingdom",
      narrative: "This is a classic, effective leadership pairing. The Sovereign provides the high-level vision, structure, and authority, while the Provider works tirelessly on the ground to ensure the needs of the people are met. Together, you build systems that are both powerful and humane.",
    },
    clash: {
      title: "The System vs. The People",
      narrative: "The Sovereign can become so focused on the integrity of the overall system that they lose sight of the individuals within it. The Provider's focus on individual needs can feel like a series of annoying exceptions to the Sovereign's elegant rules.",
      playbook: {
        a: "Your job is to translate the Provider's concerns into system-level data. Show how 'unhappy people' is a metric that threatens the long-term stability of your kingdom. Use their insights as a diagnostic tool.",
        b: "Your job is to speak up for the human element. Frame your requests not as complaints, but as crucial data points the Sovereign needs to make wise decisions. You are their eyes and ears on the ground."
      }
    }
  },
  'architect-seeker': {
    sync: {
      title: "Bulletproof Logic",
      narrative: "When you are aligned on a problem, you are an intellectual powerhouse. The Architect's ability to build complex systems, combined with the Seeker's ability to find any hidden flaw, allows you to create truly resilient and rigorous solutions."
    },
    clash: {
      title: "Elegant Design vs. Harsh Reality",
      narrative: "The Architect is in love with the beauty and internal consistency of their system. The Seeker is in love with the unvarnished truth, no matter how ugly. The Seeker's ruthless questioning can feel like a destructive attack on the Architect's beautiful creation.",
      playbook: {
        a: "Your job is to see the Seeker's questions as the ultimate form of quality control. They are not trying to destroy your work; they are trying to make it perfect. Treat their feedback as a gift.",
        b: "Your job is to frame your questions with care. Acknowledge the elegance of the Architect's system before you point out its flaws. Show that you appreciate the design, even as you test its limits."
      }
    }
  },
  'navigator-rebel': {
    sync: {
      title: "Creative Anarchy",
      narrative: "In a true crisis with no clear path forward, this pairing can thrive. The Navigator's ability to adapt is supercharged by the Rebel's willingness to break any and all rules. You can find solutions that no one else would dare to consider."
    },
    clash: {
      title: "Leading vs. Undermining",
      narrative: "The Navigator leads by adapting to the group's needs, but the Rebel resists being led at all. The Rebel's constant challenging of authority can make it impossible for the Navigator to build the consensus needed to move the group forward.",
      playbook: {
        a: "Your job is to give the Rebel a special role as your 'official challenger.' Empower them to question your assumptions, but within a structure that serves the group's goal rather than just their own need for autonomy.",
        b: "Your job is to be the loyal opposition. Your challenges are most effective when they are aimed at a specific, flawed part of the plan, rather than a generalized attack on the Navigator's authority."
      }
    }
  },
  'partner-sovereign': {
    sync: {
      title: "Flawless Execution",
      narrative: "This is a powerful pairing for getting things done. The Sovereign's clear, authoritative vision provides the Partner with the stability and predictability they crave. The Sovereign makes the plan; the Partner executes it without question or complaint.",
    },
    clash: {
      title: "Authority vs. Humanity",
      narrative: "The Sovereign's focus on the grand plan can lead them to treat the Partner like a cog in the machine. The Partner's quiet, steady presence can be mistaken for a lack of opinion or feeling, leading to a situation where they feel devalued but are unable to speak up.",
      playbook: {
        a: "Your job is to remember that your most loyal subject is still a human being. Schedule regular, personal check-ins. Ask for their opinion. Show them that you value their humanity, not just their obedience.",
        b: "Your job is to find a safe way to express your needs. The Sovereign respects loyalty, so frame your feedback in those terms: 'To do my best work for you, I need a more predictable schedule.' Help them help you."
      }
    }
  },
  'rebel-spotlight': {
    sync: {
      title: "A Spectacle of Disruption",
      narrative: "When you're aligned against a boring or unjust system, you know how to make a scene. The Rebel provides the shocking, rule-breaking act, and the Spotlight provides the charisma and showmanship to turn it into a media-worthy event.",
    },
    clash: {
      title: "The Cause vs. The Applause",
      narrative: "The Rebel is motivated by a deep-seated need to challenge authority, while the Spotlight is motivated by a need for attention and validation. Friction arises when the Spotlight becomes more interested in the performance than the protest, turning a genuine act of rebellion into a shallow stunt.",
      playbook: {
        a: "Your job is to give the Rebel's actions a bigger stage. Use your charisma to attract an audience, but always give the Rebel credit for the core idea. You are the amplifier, not the source.",
        b: "Your job is to trust the Spotlight's instincts for performance. Your act of rebellion is more powerful if people are actually there to see it. Let them handle the marketing."
      }
    }
  },
  'architect-provider': {
    sync: {
      title: "Holistic Systems",
      narrative: "Together, you create systems that are not just technically elegant, but also deeply humane. The Architect ensures the design is logical and efficient, while the Provider ensures it is practical, user-friendly, and supportive of people's actual needs."
    },
    clash: {
      title: "Perfection vs. Practicality",
      narrative: "The Architect can become obsessed with the theoretical perfection of the system, creating something that is beautiful but difficult to use. The Provider's focus on immediate, practical needs can feel like a series of messy compromises to the Architect's clean design.",
      playbook: {
        a: "Your job is to remember that a system is only as good as its ability to serve its users. See the Provider not as someone who compromises your vision, but as the person who makes it truly useful.",
        b: "Your job is to translate human needs into system requirements. Frame your feedback in practical, actionable terms that the Architect can use to improve the design without sacrificing its core principles."
      }
    }
  },
  'architect-sovereign': {
    sync: {
      title: "Unstoppable Execution",
      narrative: "When you agree on a plan, your ability to execute is second to none. The Architect's meticulous planning ensures there are no surprises, and the Sovereign's commanding authority ensures everyone stays on task. You build empires.",
    },
    clash: {
      title: "The One True Plan",
      narrative: "Conflict arises when you disagree on the optimal plan. Both archetypes believe in a single, correct way of doing things. This can lead to a gridlock of competing manifestos, as each of you is convinced your system is the superior one.",
      playbook: {
        a: "Your job is to sell your plan to the Sovereign. Show them how your design will enhance their authority and ensure the stability of their kingdom. Treat them as your most important client.",
        b: "Your job is to give the Architect a clear set of requirements and then trust them to design the system. You are the 'what,' and they are the 'how.' Micromanaging their design process will only lead to frustration."
      }
    }
  },
  'architect-spotlight': {
    sync: {
      title: "A Flawless Show",
      narrative: "This is the classic 'director and star' pairing. The Architect's meticulous attention to detail creates the perfect stage, and the Spotlight's charismatic performance brings it to life. When you're aligned, you can create truly magical experiences.",
    },
    clash: {
      title: "The Script vs. The Improvisation",
      narrative: "The Architect lives by the script, while the Spotlight thrives on reading the room and improvising. The Spotlight's desire to go 'off-book' can feel like a chaotic threat to the Architect's carefully crafted experience. The Architect's rigidity can feel like a creative prison to the Spotlight.",
      playbook: {
        a: "Build moments for improvisation into your script. Create a planned 'encore' or a 'fan interaction' segment where the Spotlight is *supposed* to shine. This gives them a structured outlet for their spontaneous energy.",
        b: "Your job is to understand the Architect's core intent. As long as you are serving the ultimate goal of the show, a little improvisation can be a good thing. Just make sure you're not rewriting the entire play on the fly."
      }
    }
  },
  'architect-vessel': {
    sync: {
      title: "A Space for Deep Work",
      narrative: "The Vessel's ability to create a calm, stable, and non-judgmental environment is the perfect complement to the Architect's need for quiet, focused concentration. The Vessel provides the silent sanctuary where the Architect can do their best work.",
    },
    clash: {
      title: "Order vs. Peace",
      narrative: "The Architect's need for external order can feel disruptive to the Vessel's need for internal peace. The Architect's constant adjustments to the environment can feel like a source of low-grade, persistent stress to the Vessel, who just wants things to be still.",
      playbook: {
        a: "Your job is to recognize that the Vessel's internal state is more important than the external environment. Before you rearrange the furniture, check in with them. A peaceful partner is a more valuable asset than a perfectly organized room.",
        b: "Your job is to provide a clear, gentle signal when the Architect's organizing is becoming a source of stress. A simple, 'I need a moment of stillness' is a gift of clarity that the Architect can understand and respect."
      }
    }
  },
  'diplomat-provider': {
    sync: {
      title: "Comprehensive Care",
      narrative: "When you are aligned, you provide an unbeatable support system. The Diplomat's empathy ensures that you are always focused on the right problem, and the Provider's diligence ensures that the solution is executed flawlessly. You leave no need unmet."
    },
    clash: {
      title: "Feelings vs. Fixes",
      narrative: "The Diplomat's first instinct is to make sure everyone feels heard, while the Provider's first instinct is to solve the problem. The Provider's rush to a solution can feel dismissive to the Diplomat, and the Diplomat's focus on feelings can feel inefficient to the Provider.",
      playbook: {
        a: "Your job is to translate feelings into actionable requests. It's not enough to say 'The team is stressed.' You need to ask, 'What is the one practical thing the Provider can do to help?'",
        b: "Your job is to understand that 'being heard' is often the first step in the solution. Before you jump to a fix, ask the Diplomat, 'What is the emotional need here?' and listen to the answer."
      }
    }
  },
  'diplomat-rebel': {
    sync: {
      title: "Conscious Disruption",
      narrative: "When the Rebel's disruptive energy is aimed at a genuine injustice, the Diplomat can be a powerful ally. The Diplomat's empathy can help the Rebel articulate their anger in a way that wins hearts and minds, turning a chaotic protest into a powerful movement."
    },
    clash: {
      title: "Harmony vs. Honesty",
      narrative: "The Rebel's need to speak the brutal, unvarnished truth will inevitably clash with the Diplomat's need to maintain social harmony. The Diplomat will see the Rebel as a needlessly provocative source of conflict, and the Rebel will see the Diplomat as a dishonest people-pleaser.",
      playbook: {
        a: "Your job is to help the Rebel choose their battles. Not every truth needs to be spoken, and not every fight needs to be fought. Use your empathy to guide their fire toward the targets that matter most.",
        b: "Your job is to recognize that some truths are more important than harmony. The Diplomat can help you deliver your message with more grace, but don't let them talk you out of delivering it at all."
      }
    }
  },
  'diplomat-sovereign': {
    sync: {
      title: "Benevolent Rule",
      narrative: "This is a powerful and effective leadership combination. The Sovereign provides the structure and authority to keep the system running, while the Diplomat provides the emotional intelligence to ensure the people within the system feel valued and understood.",
    },
    clash: {
      title: "The Rules vs. The Exceptions",
      narrative: "The Sovereign builds a kingdom based on a clear, consistent set of rules. The Diplomat is always focused on the individual exceptions to those rules. The Diplomat's constant requests for special consideration can feel like a threat to the integrity of the Sovereign's system.",
      playbook: {
        a: "Your job is to translate your empathetic insights into system-level principles. Instead of asking for a one-off exception, ask, 'How can we make the rules more humane for everyone?'",
        b: "Your job is to see your Diplomat as your most important advisor on public sentiment. Their requests for exceptions are not a weakness in your system; they are a vital source of data about how to improve it."
      }
    }
  },
  'diplomat-spotlight': {
    sync: {
      title: "The Perfect Party",
      narrative: "You are masters of the social realm. The Diplomat's warmth makes everyone feel welcome and safe, while the Spotlight's energy makes everything feel exciting and fun. You can host anything, from an intimate dinner to a massive festival.",
    },
    clash: {
      title: "Deep Connection vs. Broad Appeal",
      narrative: "The Diplomat thrives on deep, one-on-one connections, while the Spotlight thrives on being the center of attention for the entire room. The Diplomat can feel like the Spotlight is being shallow, and the Spotlight can feel like the Diplomat is being boring.",
      playbook: {
        a: "Your job is to create the intimate, one-on-one moments where you can shine, even within a larger party. See the Spotlight not as a competitor for attention, but as the person who brings everyone to the party in the first place.",
        b: "Your job is to publicly celebrate the Diplomat's gift for connection. Use your platform to praise their ability to make everyone feel special. Your public validation is a powerful gift."
      }
    }
  },
  'diplomat-vessel': {
    sync: {
      title: "A Haven of Peace",
      narrative: "When you are together, you create an environment of profound psychological safety. The Diplomat's active empathy and the Vessel's passive calm combine to create a space where people can be vulnerable without fear of judgment. You are a sanctuary in a chaotic world.",
    },
    clash: {
      title: "Active Soothing vs. Passive Stillness",
      narrative: "The Diplomat's instinct is to actively engage with and soothe other people's emotions, which can feel like a source of disruption to the Vessel, who just wants to sit in quiet stillness. The Vessel's lack of active engagement can feel like a cold shoulder to the Diplomat.",
      playbook: {
        a: "Your job is to recognize that the Vessel's silence is a form of support, not a rejection. They are not asking you to solve their feelings; they are asking you to sit with them. Learn to be quiet together.",
        b: "Your job is to give the Diplomat a clear signal when you need space. A simple, 'I need a moment of quiet' is a gift of clarity that prevents the Diplomat from overthinking or trying too hard to 'fix' you."
      }
    }
  },
  'navigator-provider': {
    sync: {
      title: "A Well-Stocked Expedition",
      narrative: "You are an unstoppable team for venturing into the unknown. The Navigator's love for exploration, combined with the Provider's talent for practical support, means you can handle any challenge the world throws at you.",
    },
    clash: {
      title: "The Horizon vs. The Home",
      narrative: "The Navigator's constant desire for new experiences can feel exhausting and destabilizing to the Provider, who finds satisfaction in taking care of the here and now. The Provider's focus on immediate needs can feel like a lack of vision to the Navigator.",
      playbook: {
        a: "Your job is to frame your explorations in a way that feels safe and manageable to the Provider. Create a clear itinerary, set a budget, and define a return date. Show them that adventure doesn't have to mean chaos.",
        b: "Your job is to see the Navigator's explorations as a way to find new resources to better care for your people. Their adventures aren't a distraction from your mission; they are a vital part of its long-term success."
      }
    }
  },
  'navigator-seeker': {
    sync: {
      title: "The Discovery Channel",
      narrative: "You are a powerful team for turning exploration into knowledge. The Navigator has the courage to venture into the unknown, and the Seeker has the intellectual rigor to make sense of what you find. You replace mystery with understanding.",
    },
    clash: {
      title: "Action vs. Analysis",
      narrative: "The Navigator's instinct is to keep moving and see what's next, while the Seeker's instinct is to stop and analyze every new piece of data. The Seeker's need for rigor can feel like a frustrating delay to the Navigator, and the Navigator's need for speed can feel intellectually sloppy to the Seeker.",
      playbook: {
        a: "Your job is to build time for analysis into your itinerary. Treat the Seeker's deep-dives not as a delay, but as a necessary part of the expedition. You're not just moving; you're learning.",
        b: "Your job is to provide the Navigator with a clear 'go/no-go' signal. They don't need your full, nuanced analysis in the moment. They need you to tell them if it's safe to proceed. Deliver the headline, and save the footnotes for later."
      }
    }
  },
  'navigator-sovereign': {
    sync: {
      title: "Empire Building",
      narrative: "This is the classic pairing for expansion and growth. The Navigator's adventurous spirit allows you to discover and conquer new territory, and the Sovereign's talent for system-building allows you to effectively govern it. You are a force for manifest destiny.",
    },
    clash: {
      title: "The Frontier vs. The Capital",
      narrative: "The Navigator thrives in the chaos and uncertainty of the frontier, while the Sovereign thrives on the order and stability of the capital. The Sovereign's rules and regulations can feel like a cage to the Navigator, and the Navigator's improvisational style can feel like a threat to the Sovereign's control.",
      playbook: {
        a: "Your job is to be the loyal explorer, not the rogue agent. Frame your discoveries in terms of the value they bring back to the kingdom. Your expeditions serve the empire; they don't undermine it.",
        b: "Your job is to give the Navigator a long leash. Grant them the autonomy and resources to explore, but require them to regularly report back. Trust them to manage the chaos on the frontier, as long as they respect your authority back home."
      }
    }
  },
  'navigator-spotlight': {
    sync: {
      title: "An Unforgettable Adventure",
      narrative: "You are experts at creating peak experiences. The Navigator knows how to find the most exciting and novel adventures, and the Spotlight knows how to turn those adventures into a party. Life with you is never boring.",
    },
    clash: {
      title: "The Experience vs. The Audience",
      narrative: "The Navigator is focused on the authenticity of the experience, while the Spotlight is focused on the energy of the audience. Friction arises when the Navigator wants to go on a grueling, ten-hour hike, and the Spotlight would rather be at a cool bar with a great DJ.",
      playbook: {
        a: "Your job is to find adventures that have a social component. Look for the music festival in an exotic location, or the group trek with a fun cast of characters. Find a way to combine novelty with social energy.",
        b: "Your job is to see the adventure itself as the main event. Your charisma is a powerful tool, but it's even more powerful when it's amplifying a genuinely interesting experience. Let the Navigator set the itinerary."
      }
    }
  },
  'navigator-vessel': {
    sync: {
      title: "A Peaceful Journey",
      narrative: "You have a unique ability to make the unknown feel safe. The Navigator's comfort with uncertainty, combined with the Vessel's calming presence, creates a dynamic of peaceful exploration. You are comfortable in the wilderness, both externally and internally.",
    },
    clash: {
      title: "Constant Motion vs. Deep Stillness",
      narrative: "The Navigator's constant need for new places and new experiences can feel like a source of persistent, low-grade stress to the Vessel, who craves stillness and stability. The Vessel's passivity can feel like a lack of engagement to the Navigator.",
      playbook: {
        a: "Your job is to build moments of stillness into your travels. It's not enough to see the world; you have to take the time to actually be in it. Find a beautiful spot and just sit there with the Vessel. No talking, no planning, just being.",
        b: "Your job is to provide a clear, gentle signal when you need a break. The Navigator isn't trying to exhaust you; they just have a different default setting. A simple, 'I need a day of quiet' is a gift of clarity they can work with."
      }
    }
  },
  'partner-provider': {
    sync: {
      title: "Absolute Reliability",
      narrative: "When you are aligned, you form the most dependable backbone any team could ask for. The Partner's love for consistency and the Provider's dedication to service mean that nothing ever falls through the cracks. You are the definition of trustworthy.",
    },
    clash: {
      title: "The Routine vs. The Need",
      narrative: "The Partner finds comfort in a predictable, stable routine. The Provider, however, is driven to respond to the needs of the moment, which can often be unpredictable. The Provider's emergent tasks can feel like a chaotic disruption to the Partner's steady rhythm.",
      playbook: {
        a: "Your job is to build a routine that includes time for the Provider's 'fire drills.' Create a predictable system that has room for unpredictability. This allows you to maintain your rhythm while giving them the flexibility they need.",
        b: "Your job is to appreciate the value of the Partner's stability. Their routines aren't a cage; they are the reliable foundation that gives you the freedom to handle emergencies. Protect their process whenever you can."
      }
    }
  },
  'partner-rebel': {
    sync: {
      title: "A Worthy Target",
      narrative: "The Partner's loyalty is not given lightly. When the Rebel convinces the Partner that the system they're supporting is truly unjust, the Partner's steady energy can provide a powerful, grounding force to the Rebel's chaotic disruption. You can become a surprisingly effective revolutionary team.",
    },
    clash: {
      title: "Loyalty vs. Freedom",
      narrative: "This is a fundamental conflict. The Partner's core drive is to 'stick together' and maintain the stability of the group. The Rebel's core drive is to challenge every rule and every leader. The Rebel will see the Partner as a mindless follower, and the Partner will see the Rebel as a disloyal agent of chaos.",
      playbook: {
        a: "Your job is to question the 'why' behind your loyalty. Is the system you're supporting truly worthy of your dedication? The Rebel's questions can be a gift, forcing you to re-evaluate your commitments and ensure they are well-placed.",
        b: "Your job is to aim your fire at the rules, not the relationships. The Partner's loyalty is a powerful force. If you can convince them the rules are the problem, they can become your strongest ally. Don't mistake their stability for weakness."
      }
    }
  },
  'partner-seeker': {
    sync: {
      title: "The Scientific Method",
      narrative: "You are a powerful combination for creating reliable, evidence-based processes. The Seeker's analysis can identify the true 'best practices,' and the Partner's consistency can ensure that those practices are followed with perfect fidelity every single time.",
    },
    clash: {
      title: "Process vs. Principles",
      narrative: "The Partner is focused on the 'how'—the repeatable, documented process. The Seeker is focused on the 'why'—the underlying principles and truths. The Seeker's constant questioning of the process can feel like a disruptive waste of time to the Partner, who just wants to get the work done.",
      playbook: {
        a: "Your job is to build a process for process improvement. Create a regular, scheduled time for the Seeker to present their findings and suggest optimizations. This contains their questioning in a productive, predictable way.",
        b: "Your job is to frame your insights in the language of process. Don't just present a new truth; present a new, better checklist. Show the Partner how your ideas can be translated into a more efficient and reliable routine."
      }
    }
  },
  'partner-spotlight': {
    sync: {
      title: "A Flawless Performance",
      narrative: "This is the classic 'star and stage manager' dynamic. The Partner's reliable, behind-the-scenes work creates the perfect conditions for the Spotlight to shine. The Partner finds satisfaction in flawless execution, and the Spotlight finds satisfaction in a flawless performance.",
    },
    clash: {
      title: "Invisibility vs. Visibility",
      narrative: "The Partner is happy to work diligently in the background, but they are not invisible. Friction arises when the Spotlight takes the Partner's hard work for granted, soaking up all the applause without acknowledging the person who built the stage.",
      playbook: {
        a: "Your job is to learn to ask for the appreciation you need. The Spotlight isn't intentionally ignoring you; they're just focused on the audience. A simple, 'I'd love a shout-out for the work I did on this' is a gift of clarity.",
        b: "Your job is to be the Partner's biggest fan. You live for the applause, so use your platform to get them some. Publicly celebrate their hard work. Your praise is a powerful currency, and it costs you nothing to spend it."
      }
    }
  },
  'partner-visionary': {
    sync: {
      title: "Building the Cathedral",
      narrative: "When the Visionary's grand idea is compelling enough to earn the Partner's loyalty, you can achieve incredible things. The Visionary provides the inspiring, long-term goal, and the Partner provides the patient, day-by-day execution needed to see it through, brick by brick.",
    },
    clash: {
      title: "The Grand Plan vs. The Daily Grind",
      narrative: "The Visionary is always focused on the next, even bigger idea, which can be deeply demoralizing for the Partner, who is focused on the slow, steady work of the *current* plan. The Visionary's constant pivoting can feel like a betrayal of the Partner's loyalty.",
      playbook: {
        a: "Your job is to protect the Visionary from their own creative chaos. Help them commit to a plan and see it through. Your stability is a powerful gift, but it only works if you can convince them to stand still long enough to receive it.",
        b: "Your job is to celebrate the Partner's steady progress. They are not a machine; they are a loyal supporter of your dream. Acknowledge their hard work and show them how their daily contributions are making your grand vision a reality."
      }
    }
  },
  'seeker-sovereign': {
    sync: {
      title: "Enlightened Despotism",
      narrative: "When the Sovereign trusts the Seeker's analysis, you create a system that is both highly effective and grounded in reality. The Sovereign's power is tempered by the Seeker's intellectual honesty, leading to wise and sustainable rule.",
    },
    clash: {
      title: "Inconvenient Truths",
      narrative: "The Seeker is compelled to tell the truth, even if it undermines the Sovereign's authority or complicates their plan. The Sovereign, who demands order and adherence to the plan, can see the Seeker's unvarnished truth as a form of insubordination.",
      playbook: {
        a: "Your job is to deliver your analysis with respect for the Sovereign's position. Frame your findings as a tool to help them win, not as a judgment of their past decisions. You are the advisor, not the critic.",
        b: "Your job is to create a formal process for hearing the Seeker's dissent. Create a 'Royal Council' where they are expected to present their unvarnished findings. This contains their truth-telling in a way that serves your rule, rather than threatening it."
      }
    }
  },
  'seeker-vessel': {
    sync: {
      title: "Deep Contemplation",
      narrative: "You are both comfortable with the quiet work of introspection. The Seeker analyzes the external world, while the Vessel observes the internal one. Together, you can arrive at profound insights that others, lost in the noise of the world, might miss.",
    },
    clash: {
      title: "Analysis vs. Acceptance",
      narrative: "The Seeker's mind is a restless machine, always analyzing and deconstructing. This can be disruptive to the Vessel, who seeks a state of simple, non-judgmental acceptance. The Seeker's need to 'figure things out' can feel like a source of stress to the Vessel.",
      playbook: {
        a: "Your job is to learn the value of stillness. Not every problem needs to be solved; some just need to be observed. The Vessel can teach you how to turn off your analytical mind and just be present.",
        b: "Your job is to provide a safe, non-judgmental space for the Seeker's restless mind. You don't have to engage with their analysis; just provide a calm presence that allows them to spin down. Your quiet is a gift."
      }
    }
  },
  'sovereign-vessel': {
    sync: {
      title: "The Peaceful Kingdom",
      narrative: "When you are aligned, you create a state of perfect, ordered tranquility. The Sovereign's ability to build and maintain systems, combined with the Vessel's calming presence, creates an environment where everyone feels safe, secure, and at peace.",
    },
    clash: {
      title: "The Demands of the Crown vs. The Need for Peace",
      narrative: "The Sovereign's role requires constant vigilance, decision-making, and engagement with the messy realities of power. This can be deeply draining for the Vessel, who craves a quiet, conflict-free existence. The Vessel's passivity can feel like a dereliction of duty to the Sovereign.",
      playbook: {
        a: "Your job is to protect the Vessel's peace. See their calm not as a weakness, but as a strategic resource for your kingdom. A peaceful home is the ultimate symbol of a successful rule. Delegate the dirty work.",
        b: "Your job is to be the Sovereign's sanctuary. You don't have to sit on the throne with them, but you can provide the quiet space they retreat to when the burdens of rule become too heavy. Your peace is a gift."
      }
    }
  }
};

interface ArchetypeComparison {
  a: ArchetypeVitals;
  b: ArchetypeVitals;
  narrative: DualityNarrative;
  interaction: ArchetypeInteraction;
}

export function compareArchetypes(profileA: GZProfile, profileB: GZProfile): ArchetypeComparison {
  const idA = profileA.archetype?.id || 'unknown';
  const idB = profileB.archetype?.id || 'unknown';
  
  const vitalsA = ARCHETYPE_VITALS[idA] || ARCHETYPE_VITALS.unknown;
  const vitalsB = ARCHETYPE_VITALS[idB] || ARCHETYPE_VITALS.unknown;

  const sortedIds = [idA, idB].sort();
  const narrativeKey = sortedIds.join('-');
  
  let narrative = DUALITY_NARRATIVES[narrativeKey] || {
    title: `${vitalsA.title} vs. ${vitalsB.title}`,
    summary: `A fascinating dynamic between one driven by ${vitalsA.drive} and another by ${vitalsB.drive}.`
  };
  
  let interaction = ARCHETYPE_INTERACTIONS[narrativeKey];

  if (interaction) {
      const isReversed = idA !== sortedIds[0];
      if (isReversed && interaction.clash.playbook) {
          const originalA = interaction.clash.playbook.a;
          interaction.clash.playbook.a = interaction.clash.playbook.b;
          interaction.clash.playbook.b = originalA;
      }
  } else {
      interaction = {
        sync: { title: "Shared Strengths", narrative: "Your archetypes find common ground in their shared approach to..." },
        clash: { title: "Potential Friction", narrative: "Tension can arise from your differing approaches to..." }
      };
  }

  return {
    a: vitalsA,
    b: vitalsB,
    narrative,
    interaction,
  };
}

if (process.env.NODE_ENV === 'development') {
  const CORE = [
    'sovereign','rebel','visionary','guardian','navigator','seeker',
    'vessel','partner','diplomat','spotlight','architect','provider'
  ];

  const allPairs = CORE.flatMap((a,i) =>
    CORE.slice(i+1).map(b => [a,b].sort().join('-'))
  );

  function keysOf<T>(o: Record<string, T>) { return Object.keys(o); }

  function diff(label: string, obj: Record<string, unknown>) {
    const ks = new Set(keysOf(obj));
    const missing = allPairs.filter(k => !ks.has(k));
    const extras  = keysOf(obj).filter(k =>
      !allPairs.includes(k) && k.split('-').length === 2 && CORE.includes(k.split('-')[0]) && CORE.includes(k.split('-')[1])
    );
    return { label, have: ks.size, need: allPairs.length, missing, extras };
  }

  console.log('--- Archetype Duality Coverage Check ---');
  const narrativeDiff = diff('DUALITY_NARRATIVES', DUALITY_NARRATIVES);
  if (narrativeDiff.have !== narrativeDiff.need || narrativeDiff.extras.length > 0) {
    console.error('Narrative coverage mismatch:', narrativeDiff);
  } else {
    console.log('✅ DUALITY_NARRATIVES: All 66 pairs covered.');
  }

  const interactionDiff = diff('ARCHETYPE_INTERACTIONS', ARCHETYPE_INTERACTIONS);
  if (interactionDiff.have !== interactionDiff.need || interactionDiff.extras.length > 0) {
    console.error('Interaction coverage mismatch:', interactionDiff);
  } else {
    console.log('✅ ARCHETYPE_INTERACTIONS: All 66 pairs covered.');
  }
  console.log('----------------------------------------');
}
