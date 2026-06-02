(function () {
  'use strict';

  const SC = window.SC;

  const coreDefs = {
    seed: { radius: 24, hp: 8, color: SC.colors.red, spawnInterval: 3.4, corruptInterval: 0.85, spread: 1 },
    nest: { radius: 28, hp: 11, color: SC.colors.magenta, spawnInterval: 2.7, corruptInterval: 0.75, spread: 1 }
  };

  function addCorruptionCell(game, cx, cy, ownerId) {
    if (cx < 0 || cy < 0 || cx >= SC.COLS || cy >= SC.ROWS) return;
    const key = SC.cellKey(cx, cy);
    let cell = game.corruption.get(key);
    if (!cell) {
      cell = { cx, cy, owners: new Set(), age: 0 };
      game.corruption.set(key, cell);
    }
    cell.owners.add(ownerId);
  }

  SC.addCorruptionAround = function addCorruptionAround(game, x, y, radiusCells, ownerId) {
    const centerX = Math.floor(x / SC.GRID);
    const centerY = Math.floor(y / SC.GRID);
    const r2 = radiusCells * radiusCells;
    for (let cy = centerY - radiusCells; cy <= centerY + radiusCells; cy++) {
      for (let cx = centerX - radiusCells; cx <= centerX + radiusCells; cx++) {
        const dx = cx - centerX;
        const dy = cy - centerY;
        if (dx * dx + dy * dy <= r2) {
          addCorruptionCell(game, cx, cy, ownerId);
        }
      }
    }
  };

  SC.clearCorruptionByOwner = function clearCorruptionByOwner(game, ownerId) {
    for (const [key, cell] of [...game.corruption.entries()]) {
      cell.owners.delete(ownerId);
      if (cell.owners.size === 0) game.corruption.delete(key);
    }
  };

  class Core {
    constructor(kind, cx, cy) {
      this.kind = kind;
      this.def = coreDefs[kind] || coreDefs.seed;
      this.cx = cx;
      this.cy = cy;
      const center = SC.cellCenter(cx, cy);
      this.x = center.x;
      this.y = center.y;
      this.radius = this.def.radius;
      this.hp = this.def.hp;
      this.maxHp = this.def.hp;
      this.id = SC.nextCoreId = (SC.nextCoreId || 0) + 1;
      this.dead = false;
      this.angle = SC.rand(Math.PI * 2);
      this.flash = 0;
      this.spawnTimer = 1.2;
      this.corruptTimer = 0;
      this.corruptRadius = 1;
    }

    update(dt, game) {
      this.angle += dt * 1.6;
      this.flash = Math.max(0, this.flash - dt * 6);
      this.corruptTimer -= dt;
      this.spawnTimer -= dt;

      if (this.corruptTimer <= 0) {
        this.corruptTimer = this.def.corruptInterval;
        this.corruptRadius = Math.min(7, this.corruptRadius + this.def.spread);
        SC.addCorruptionAround(game, this.x, this.y, this.corruptRadius, this.id);
      }

      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.def.spawnInterval;
        game.spawnEnemyNear(this.x, this.y, this.kind === 'nest' ? 2 : 1);
      }
    }

    hit(game) {
      this.hp -= 1;
      this.flash = 1;
      SC.effects.burst(game, this.x, this.y, this.def.color, 8);
      if (this.hp <= 0) this.kill(game);
    }

    kill(game) {
      this.dead = true;
      game.score += 260;
      SC.clearCorruptionByOwner(game, this.id);
      SC.effects.burst(game, this.x, this.y, this.def.color, 46);
      game.showBanner?.('CORE PURGED', 1.3);
    }
  }

  class SpawnEffect {
    constructor(kind, cx, cy, delay = 0.75) {
      this.kind = kind;
      this.cx = cx;
      this.cy = cy;
      const center = SC.cellCenter(cx, cy);
      this.x = center.x;
      this.y = center.y;
      this.delay = delay;
      this.time = 0;
      this.done = false;
    }

    update(dt, game) {
      this.time += dt;
      if (this.time < this.delay) return;
      this.done = true;
      const core = new Core(this.kind, this.cx, this.cy);
      game.cores.push(core);
      SC.addCorruptionAround(game, core.x, core.y, 1, core.id);
      SC.effects.burst(game, core.x, core.y, core.def.color, 28);
    }
  }

  SC.coreDefs = coreDefs;
  SC.Core = Core;
  SC.SpawnEffect = SpawnEffect;
})();

