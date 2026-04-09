(function () {
  const STORAGE_KEY = 'pixel-pet-v1-state';
  const VERSION = '1.0.0';

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function nowMs() {
    return Date.now();
  }

  function stageForAge(ageHours) {
    if (ageHours < 6) return 'baby';
    if (ageHours < 24) return 'child';
    if (ageHours < 72) return 'teen';
    return 'adult';
  }

  function createState() {
    const now = nowMs();
    return {
      pet: {
        name: 'mame',
        fixed: true,
        stage: 'baby',
        ageHours: 0,
        weight: 5,
        alive: true,
        asleep: false,
        sick: false,
        attention: false,
        poop: 0,
        causeOfDeath: ''
      },
      stats: {
        hunger: 72,
        happiness: 70,
        energy: 74,
        hygiene: 78,
        health: 82,
        discipline: 24
      },
      hidden: {
        careMistakes: 0,
        missedAttention: 0,
        snackCount: 0,
        disciplineCount: 0,
        evolutionScore: 0,
        lastEvent: 'An egg cracked. MEEP!'
      },
      meta: {
        createdAt: now,
        lastUpdateAt: now,
        lastSleptAt: 0,
        lastAwakeAt: now,
        started: false,
        version: VERSION
      }
    };
  }

  function loadState(storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return createState();
      const parsed = JSON.parse(raw);
      return parsed && parsed.pet && parsed.stats ? parsed : createState();
    } catch {
      return createState();
    }
  }

  function saveState(storage, state) {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function hoursSince(ts, now) {
    return Math.max(0, (now - ts) / 3600000);
  }

  function adultVariantFor(state) {
    const h = state.hidden;
    const s = state.stats;
    if (h.careMistakes <= 2 && h.missedAttention <= 1 && h.snackCount <= 6 && s.discipline >= 35) return 'angel';
    if (h.careMistakes >= 8 || h.missedAttention >= 5 || h.snackCount >= 12) return 'blob';
    return 'classic';
  }

  function spriteVariantFor(state) {
    const p = state.pet;
    const s = state.stats;
    if (!p.alive) return 'dead';
    if (p.asleep) return 'sleeping';
    if (p.sick) return 'sick';
    if (p.poop > 0 || s.hygiene < 35) return 'dirty';
    if (p.attention || s.happiness < 30 || s.hunger < 25) return 'attention';
    if (p.stage === 'adult') return `adult_${adultVariantFor(state)}`;
    return p.stage;
  }

  function summarizeNeeds(state) {
    const s = state.stats;
    const p = state.pet;
    if (!p.alive) return '...';
    if (p.sick) return 'SICK';
    if (p.poop > 0) return 'CLEAN';
    if (s.hunger < 30) return 'HUNGRY';
    if (s.energy < 25) return 'SLEEPY';
    if (p.attention) return 'BEEP!';
    if (s.happiness < 35) return 'BORED';
    return 'OK';
  }

  function narrationFor(state, action) {
    const p = state.pet;
    const s = state.stats;
    if (!p.alive) return '... It went still.';
    if (action === 'start_pet') return 'MEEP! It hatched and blinked.';
    if (action === 'show_dashboard') return 'Beep! Screen on.';
    if (action === 'feed_meal') return 'MEEP! Full tummy.';
    if (action === 'feed_snack') return 'Chomp. Wants another.';
    if (action === 'play') return 'BEEP! Hop hop.';
    if (action === 'clean') return 'Screen scrubbed clean.';
    if (action === 'medicine') return p.sick ? 'Glug. Medicine down.' : 'No medicine needed now.';
    if (action === 'discipline') return 'Beep... it listened.';
    if (action === 'sleep') return 'Lights off. Zzz.';
    if (action === 'wake') return 'Blink blink. Awake.';
    if (action === 'tick') return '...time passed.';
    if (s.hunger < 25) return 'It looks hungry.';
    if (p.sick) return 'It looks sick.';
    if (p.poop > 0) return 'Uh oh, it made a mess.';
    if (s.energy < 20) return 'Its eyes look heavy.';
    if (p.attention) return 'BEEP! BEEP!';
    return '...';
  }

  function applyDecay(state, now) {
    if (!state.pet.alive) return state;
    if (!state.meta.started) {
      state.meta.lastUpdateAt = now;
      return state;
    }

    const elapsedHours = hoursSince(state.meta.lastUpdateAt, now);
    if (elapsedHours <= 0) return state;

    const s = state.stats;
    const p = state.pet;
    const h = state.hidden;

    p.ageHours += elapsedHours;
    p.stage = stageForAge(p.ageHours);

    const hungerDrop = p.asleep ? 4 : 7;
    const happinessDrop = p.asleep ? 2 : 4;
    const energyDrop = p.asleep ? -10 : 5;
    const hygieneDrop = 3 + p.poop * 1.5;

    s.hunger = clamp(s.hunger - hungerDrop * elapsedHours, 0, 100);
    s.happiness = clamp(s.happiness - happinessDrop * elapsedHours, 0, 100);
    s.energy = clamp(s.energy - energyDrop * elapsedHours, 0, 100);
    s.hygiene = clamp(s.hygiene - hygieneDrop * elapsedHours, 0, 100);
    s.discipline = clamp(s.discipline - 0.6 * elapsedHours, 0, 100);

    if (Math.random() < Math.min(0.35, elapsedHours * 0.09) && !p.asleep) p.attention = true;
    if (elapsedHours >= 1.8) p.poop += Math.floor(elapsedHours / 1.8);

    const neglect = [s.hunger, s.happiness, s.energy, s.hygiene].filter(v => v < 20).length;
    if (neglect > 0) {
      s.health = clamp(s.health - elapsedHours * (5 + neglect * 4), 0, 100);
      h.careMistakes += elapsedHours * 0.5 * neglect;
    } else if (!p.sick) {
      s.health = clamp(s.health + elapsedHours * 1.1, 0, 100);
    }

    if ((s.hygiene < 25 || p.poop >= 3 || s.hunger < 15) && Math.random() < Math.min(0.5, 0.12 * elapsedHours)) p.sick = true;
    if (p.sick) s.health = clamp(s.health - elapsedHours * 7, 0, 100);

    if (p.attention && !p.asleep && Math.random() < Math.min(0.5, elapsedHours * 0.15)) {
      h.missedAttention += 1;
      s.happiness = clamp(s.happiness - 5, 0, 100);
    }

    if (h.snackCount > 8) s.health = clamp(s.health - elapsedHours * 1.2, 0, 100);

    if (s.health <= 0 || (s.hunger <= 0 && s.energy <= 0 && s.hygiene <= 0)) {
      p.alive = false;
      p.causeOfDeath = s.health <= 0 ? 'neglect' : 'extreme neglect';
      h.lastEvent = 'The pet went still.';
    }

    state.meta.lastUpdateAt = now;
    return state;
  }

  function applyAction(state, action, now) {
    const s = state.stats;
    const p = state.pet;
    const h = state.hidden;

    if (action === 'start_pet') {
      state.meta.started = true;
      state.meta.lastUpdateAt = now;
      if (!p.alive) {
        const restarted = createState();
        restarted.meta.started = true;
        restarted.meta.lastUpdateAt = now;
        return restarted;
      }
      return state;
    }

    state = applyDecay(state, now);
    if (!p.alive && action !== 'start_pet' && action !== 'show_dashboard' && action !== 'status') return state;

    switch (action) {
      case 'status':
      case 'show_dashboard':
      case 'tick':
        break;
      case 'feed_meal':
        s.hunger = clamp(s.hunger + 24, 0, 100);
        s.health = clamp(s.health + 2, 0, 100);
        p.weight += 1;
        p.attention = false;
        h.evolutionScore += 1;
        break;
      case 'feed_snack':
        s.happiness = clamp(s.happiness + 16, 0, 100);
        s.hunger = clamp(s.hunger + 8, 0, 100);
        p.weight += 2;
        h.snackCount += 1;
        if (h.snackCount > 5) s.health = clamp(s.health - 3, 0, 100);
        break;
      case 'play':
        s.happiness = clamp(s.happiness + 18, 0, 100);
        s.energy = clamp(s.energy - 10, 0, 100);
        s.hunger = clamp(s.hunger - 6, 0, 100);
        s.discipline = clamp(s.discipline + 2, 0, 100);
        p.attention = false;
        h.evolutionScore += 1;
        break;
      case 'clean':
        p.poop = 0;
        s.hygiene = clamp(s.hygiene + 24, 0, 100);
        p.attention = false;
        break;
      case 'medicine':
        if (p.sick || s.health < 50) {
          p.sick = false;
          s.health = clamp(s.health + 16, 0, 100);
          s.happiness = clamp(s.happiness - 2, 0, 100);
        }
        break;
      case 'discipline':
        s.discipline = clamp(s.discipline + 12, 0, 100);
        s.happiness = clamp(s.happiness - 3, 0, 100);
        p.attention = false;
        h.disciplineCount += 1;
        h.evolutionScore += 0.5;
        break;
      case 'sleep':
        p.asleep = true;
        state.meta.lastSleptAt = now;
        break;
      case 'wake':
        p.asleep = false;
        state.meta.lastAwakeAt = now;
        break;
      default:
        break;
    }

    if (p.ageHours >= 6 && p.stage === 'child') h.lastEvent = 'It grew into a child.';
    if (p.ageHours >= 24 && p.stage === 'teen') h.lastEvent = 'It grew into a teen.';
    if (p.ageHours >= 72 && p.stage === 'adult') h.lastEvent = 'It became an adult.';

    state.meta.lastUpdateAt = now;
    return state;
  }

  function runAction(storage, action) {
    const now = nowMs();
    let state = loadState(storage);
    state = applyAction(state, action, now);
    saveState(storage, state);

    const variant = spriteVariantFor(state);
    const result = state.pet.alive
      ? `${state.pet.name} is ${summarizeNeeds(state).toLowerCase()} (${state.pet.stage}).`
      : `${state.pet.name} has died from ${state.pet.causeOfDeath || 'neglect'}.`;

    return {
      action,
      result,
      narration: narrationFor(state, action),
      dead: !state.pet.alive,
      sprite_variant: variant,
      pet: state,
      version: VERSION
    };
  }

  window.PixelPetCore = {
    STORAGE_KEY,
    VERSION,
    createState,
    loadState,
    saveState,
    runAction,
    spriteVariantFor,
    adultVariantFor,
    summarizeNeeds
  };
})();
